import { Provider, useAtom } from 'jotai';
import { MouseEvent, ReactNode, useEffect, useRef } from 'react';
import { styled } from 'src/stitches.config';
import { v4 } from 'uuid';
import { blocksAtom, isSelectAllAtom } from '../../constants/atom';
import { BackspaceKey } from '../../constants/key';
import { useActiveBlockId } from '../../hooks/use-active-element';
import { useEventListener } from '../../hooks/use-event-listener';
import {
  findBlockByIndex,
  findLastBlock,
  focusLastBlock,
  lastCursor,
} from '../../utils/find-blocks';
import { generateGetBoundingClientRect } from '../../utils/virtual-element';
import { Block } from '../block/block';
import { InlineToolBar } from '../inline-toolbar';
import { useVirtualPopper } from '../virtual-popper/use-virtual-popper';
import { VirtualPopper } from '../virtual-popper/virtual-popper';

export type BlockType<T = any> = {
  id: string;
  type: string;
  data: T;
};

interface EditorProps {
  data?: BlockType[];
  defaultData?: BlockType[];
  children?: ReactNode;
}

const Wrapper = styled('div', {
  flexShrink: 0,
  flexGrow: 1,
  width: '100%',
  maxWidth: '100%',
  display: 'flex',
  alignItems: 'center',
  flexDirection: 'column',
  fontSize: 16,
  lineHeight: 1.5,
  color: 'rgb(55, 53, 47)',
  paddingLeft: 'calc(96px + env(safe-area-inset-left))',
  paddingRight: 'calc(96px + env(safe-area-inset-right))',
  paddingBottom: '30vh',
  position: 'relative',
  a: {
    textDecoration: 'none',
  },
  'a:-webkit-any-link': {
    textDecoration: 'none',
  },
});

function Elliot(props: { children?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [blocks, setBlocks] = useAtom(blocksAtom);
  const active = useActiveBlockId();
  const [isSelectAll, setIsSelectAll] = useAtom(isSelectAllAtom);

  const handleClick = (e: MouseEvent) => {
    if (!active) {
      const lastBlock = findLastBlock();
      if (lastBlock) {
        const activeBlocks = blocks.find(
          (b) => b.id === lastBlock.blockId,
        );
        if (activeBlocks && activeBlocks.data) {
          setBlocks((s) => [
            ...s,
            { id: v4(), type: 'paragraph', data: '' },
          ]);
          lastBlock.editable.focus();
        } else {
          lastBlock.editable.focus();
        }
      }
    } else {
      // @ts-ignore
      active?.querySelector('[contenteditable]')?.focus();
    }
  };

  useEffect(() => {
    const handler = (e: CustomEvent) => {
      if (e.detail?.index >= 0) {
        const block = findBlockByIndex(e.detail.index);
        if (block) {
          block.editable.focus();
          requestAnimationFrame(() => {
            lastCursor();
          });
        }
      }
    };
    ref.current?.addEventListener('focus-block', handler);
    return () => {
      ref.current?.removeEventListener('focus-block', handler);
    };
  }, []);

  // useEventListener('blur', (e) => {
  //   popper.setActive(false);
  // });

  return (
    <>
      <Wrapper
        ref={ref}
        className="elliot"
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === BackspaceKey && isSelectAll) {
            setBlocks([
              {
                type: 'paragraph',
                data: '',
                id: v4(),
              },
            ]);
            setIsSelectAll(false);
            requestAnimationFrame(() => {
              focusLastBlock();
              lastCursor();
            });
          }
        }}
      >
        {props.children}
        {blocks.map((b, i) => (
          <Block index={i} key={b.id} block={b} />
        ))}
      </Wrapper>
    </>
  );
}

export const Editor = (props: EditorProps) => {
  return (
    <Provider
      // @ts-ignore
      initialValues={[[blocksAtom, props.data || []]]}
    >
      <Elliot>{props.children}</Elliot>
    </Provider>
  );
};

export const EditorUsage = (props: EditorProps) => {
  const popper = useVirtualPopper({
    placement: 'top',
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [0, 8],
        },
      },
    ],
  });

  useEventListener('selectionchange', (e) => {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) {
      return;
    }
    let selectedRange = selection.getRangeAt(0);
    if (
      Math.abs(selectedRange.startOffset - selectedRange.endOffset) >
      0
    ) {
      const rect = selectedRange.getBoundingClientRect();
      if (rect) {
        if (!popper.active) {
          popper.setActive(true);
        }
        popper.setReferenceElement({
          getBoundingClientRect: generateGetBoundingClientRect(rect),
        });
      }
    }
  });
  useEventListener('mousedown', (e) => {
    if (popper.popperElement?.contains(e.target)) {
      return;
    }
    popper.setActive(false);
  });
  return (
    <Editor {...props}>
      <VirtualPopper popper={popper}>
        <InlineToolBar />
      </VirtualPopper>
    </Editor>
  );
};
