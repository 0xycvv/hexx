import { Provider, useAtom } from 'jotai';
import {
  createContext,
  MouseEvent,
  useContext,
  useEffect,
  useRef,
} from 'react';
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
}

function Elliot() {
  const ref = useRef<HTMLDivElement>(null);
  const [blocks, setBlocks] = useAtom(blocksAtom);
  const active = useActiveBlockId();
  const [isSelectAll, setIsSelectAll] = useAtom(isSelectAllAtom);
  const popper = useVirtualPopper({
    placement: 'top-start',
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [0, 8],
        },
      },
    ],
  });

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

  useEventListener('selectionchange', (e) => {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) {
      return;
    }
    let selectedRange = window.getSelection().getRangeAt(0);
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
          getBoundingClientRect: generateGetBoundingClientRect(
            rect.x,
            rect.y,
          ),
        });
      }
    }
  });

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

  useEventListener('mousedown', (e) => {
    if (popper.popperElement?.contains(e.target)) {
      return;
    }
    popper.setActive(false);
  });

  useEventListener('blur', (e) => {
    popper.setActive(false);
  });

  return (
    <>
      <div
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
        {blocks.map((b, i) => (
          <Block index={i} key={b.id} block={b} />
        ))}
        <VirtualPopper popper={popper}>
          <InlineToolBar />
        </VirtualPopper>
        <style jsx global>{`
          .elliot {
            flex-shrink: 0;
            flex-grow: 1;
            width: 100%;
            max-width: 100%;
            display: flex;
            align-items: center;
            flex-direction: column;
            font-size: 16px;
            line-height: 1.5;
            color: rgb(55, 53, 47);
            padding-left: calc(96px + env(safe-area-inset-left));
            padding-right: calc(96px + env(safe-area-inset-right));
            padding-bottom: 30vh;
            position: relative;
          }

          .elliot a {
            text-decoration: none;
          }
          .elliot a:-webkit-any-link {
            text-decoration: none;
          }
        `}</style>
      </div>
    </>
  );
}

export const Editor = (props: EditorProps) => {
  return (
    <Provider
      // @ts-ignore
      initialValues={[[blocksAtom, props.data || []]]}
    >
      <Elliot />
    </Provider>
  );
};
