import { useAtom } from 'jotai';
import { useSelector, useUpdateAtom } from 'jotai/utils.cjs';
import { useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { blocksAtom, isSelectAllAtom } from '../../constants/atom';
import { BackspaceKey, commandKey } from '../../constants/key';
import { useEventListener } from '../../hooks/use-event-listener';
import { findLastBlock, lastCursor } from '../../utils/find-blocks';
import { removeRanges } from '../../utils/remove-ranges';
import { Editable } from '../editable';
import { BlockType } from '../editor';
import Plus from '../icons/plus';
import DragIndicator from '../icons/drag-indicator';
import styles from './block.module.css';

export function Block({
  block: defaultBlock,
  index,
}: {
  block: BlockType;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const block = useSelector(
    blocksAtom,
    (v) => v.find((b) => b.id === defaultBlock.id) || defaultBlock,
  );
  const update = useUpdateAtom(blocksAtom);
  const [isSelectAll, setIsSelectAll] = useAtom(isSelectAllAtom);

  const isEditableSelectAll = () => {
    const sel = getSelection();
    if (sel.type === 'Caret') {
      if (!sel.anchorOffset && sel.isCollapsed) {
        return true;
      }
      return false;
    }
    if (sel.type === 'Range') {
      if (!sel.anchorOffset) {
        return true;
      }
      return false;
    }
  };

  const focusBlock = (index: number) => {
    const event = new CustomEvent('focus-block', {
      detail: {
        index,
      },
      bubbles: true,
    });
    ref.current.dispatchEvent(event);
  };


  // useEventListener(
  //   'mouseup',
  //   (e) => {
  //     let selectedRange = window.getSelection().getRangeAt(0);
  //     let selectedNode = selectedRange.commonAncestorContainer;
  //     const event = new CustomEvent('selection', {
  //       detail: {
  //         index,
  //       },
  //       bubbles: true,
  //     });
  //     console.log(
  //       'selection chars range: START POS: ',
  //       selectedRange.startOffset,
  //     );
  //     console.log(
  //       'selection chars range: END POS: ',
  //       selectedRange.endOffset,
  //     );
  //   },
  //   ref.current,
  // );

  useEffect(() => {
    ref.current?.focus();
    lastCursor();
  }, []);

  return (
    <div data-block-id={block.id} className={styles.wrapper}>
      <div className={styles.menu}>
        <DragButton />
        <PlusButton />
      </div>
      <Editable
        onKeyDown={(e) => {
          if (e.key === 'ArrowUp') {
            let selectedRange = window.getSelection().getRangeAt(0);
            if (selectedRange.startOffset === 0) {
              focusBlock(index - 1);
            }
          }
          if (e[commandKey] && e.key === 'a') {
            if (isEditableSelectAll()) {
              setIsSelectAll(true);
              removeRanges();
              e.preventDefault();
            }
          }
          if (!e[commandKey] && e.key === 'Enter') {
            const newP = {
              type: 'paragraph',
              data: '',
              id: uuidv4(),
            };
            update((s) => insert(s, index + 1, newP));
            e.preventDefault();
          }
          if (e.key === BackspaceKey) {
            if (!block.data) {
              if (index === 0) {
                return;
              }
              update((s) =>
                s.filter((b) => b.id !== defaultBlock.id),
              );
              setTimeout(() => {
                const lastBlock = findLastBlock();
                lastBlock?.editable?.focus();
                lastCursor();
              }, 0);
            }
          }
        }}
        ref={ref}
        html={block.data}
        onChange={(evt) =>
          update((s) =>
            s.map((b) =>
              b.id === defaultBlock.id
                ? { ...b, data: evt.target.value }
                : b,
            ),
          )
        }
      />
      {isSelectAll && <SelectOverlay />}
    </div>
  );
}

function SelectOverlay() {
  return <div className={styles['select-overlay']} />;
}

function DragButton() {
  return (
    <div className={styles.drag}>
      <DragIndicator />
    </div>
  );
}

function PlusButton() {
  return (
    <div className={styles.plus}>
      <Plus />
    </div>
  );
}

const insert = (arr, index, newItem) => [
  // part of the array before the specified index
  ...arr.slice(0, index),
  // inserted item
  newItem,
  // part of the array after the specified index
  ...arr.slice(index),
];
