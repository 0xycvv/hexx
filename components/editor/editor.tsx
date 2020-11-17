import { atom, Provider, useAtom } from 'jotai';
import { MouseEvent, useEffect, useRef, useState } from 'react';
import { v4 } from 'uuid';
import {
  blocksAtom,
  isSelectAllAtom,
  lastRangeAtom,
} from '../../constants/atom';
import { BackspaceKey } from '../../constants/key';
import { useActiveBlockId } from '../../hooks/use-active-element';
import { useEventListener } from '../../hooks/use-event-listener';
import {
  findBlockByIndex,
  findLastBlock,
  focusLastBlock,
  lastCursor,
} from '../../utils/find-blocks';
import { Block } from '../block/block';
import styles from './editor.module.css';
import { InlineToolBar } from '../inline-toolbar';
import { usePopper } from 'react-popper';
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
  const [selectedRange, setSelectedRange] = useAtom(lastRangeAtom);
  const [referenceElement, setReferenceElement] = useState(null);
  const [popperElement, setPopperElement] = useState(null);
  const popper = usePopper(referenceElement, popperElement, {
    placement: 'top-start',
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [0, 10],
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
    try {
      let selectedRange = window.getSelection().getRangeAt(0);
      let selectedNode = selectedRange.commonAncestorContainer;
      if (
        Math.abs(
          selectedRange.startOffset - selectedRange.endOffset,
        ) > 0
      ) {
        const rect = selectedRange.getBoundingClientRect();
        console.log(rect);
        if (rect) {
          setReferenceElement({
            getBoundingClientRect: generateGetBoundingClientRect(
              rect.x,
              rect.y,
            ),
          });
        }
      } else {
        setReferenceElement({
          getBoundingClientRect: generateGetBoundingClientRect(),
        });
      }
    } catch (error) {
      console.log(error);
    }
  });

  useEffect(() => {
    ref.current?.addEventListener('focus-block', (e: CustomEvent) => {
      if (e.detail?.index >= 0) {
        const block = findBlockByIndex(e.detail.index);
        if (block) {
          block.editable.focus();
          requestAnimationFrame(() => {
            lastCursor();
          });
        }
      }
    });
  }, []);

  return (
    <div
      ref={ref}
      className={styles.editor}
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
      <div
        ref={setPopperElement}
        style={popper.styles.popper}
        {...popper.attributes.popper}
      >
        <InlineToolBar />
      </div>
    </div>
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

function generateGetBoundingClientRect(x = -10000, y = -10000) {
  console.log(x, y);
  return () => ({
    width: 0,
    height: 0,
    top: y,
    right: x,
    bottom: y,
    left: x,
  });
}
