import { useAtom } from 'jotai';
import { useSelector } from 'jotai/utils.cjs';
import { KeyboardEvent, useEffect, useRef } from 'react';
import { blocksAtom, isSelectAllAtom } from 'src/constants/atom';
import { BackspaceKey, commandKey } from 'src/constants/key';
import {
  findBlockByIndex,
  focusLastBlock,
  lastCursor,
} from 'src/utils/find-blocks';
import { removeRanges } from 'src/utils/remove-ranges';
import { v4 as uuidv4 } from 'uuid';
import { Editable, isEditableSelectAll } from '../editable';
import { BlockType, useEditor } from '../editor';
import { AlignCenter } from '../icons';

export function TextBlock({
  index,
  block: defaultBlock,
}: {
  index: number;
  block: BlockType;
}) {
  const [isSelectAll, setIsSelectAll] = useAtom(isSelectAllAtom);
  const ref = useRef<HTMLDivElement>(null);
  const {
    insertBlock,
    removeBlockWithId,
    updateBlockDataWithId,
  } = useEditor();
  const block = useSelector(
    blocksAtom,
    (v) => defaultBlock && v.find((b) => b.id === defaultBlock.id),
  );

  const focusBlock = (index: number) => {
    const event = new CustomEvent('focus-block', {
      detail: {
        index,
      },
      bubbles: true,
    });
    ref.current.dispatchEvent(event);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      let selectedRange = window.getSelection().getRangeAt(0);
      if (selectedRange.startOffset === 0) {
        console.log(index);
        focusBlock(index - 1);
      }
    }
    if (e.key === 'ArrowDown') {
      let selectedRange = window.getSelection().getRangeAt(0);
      if (
        !(selectedRange.commonAncestorContainer as Text)?.length ||
        ((selectedRange.commonAncestorContainer as Text)?.length ===
          selectedRange.endOffset &&
          selectedRange.collapsed)
      ) {
        focusBlock(index + 1);
      }
    }
    if (e[commandKey] && e.key === 'a') {
      if (isSelectAll) {
        e.preventDefault();
      }
      if (isEditableSelectAll()) {
        setIsSelectAll(true);
        removeRanges();
        e.preventDefault();
      }
      return;
    }
    if (!e[commandKey] && e.key === 'Enter') {
      insertBlock({
        index: index + 1,
        block: TextBlock.defaultValue,
      });
      e.preventDefault();
    }
    if (e.key === BackspaceKey) {
      if (!block.data) {
        if (index === 0) {
          return;
        }
        removeBlockWithId({ id: defaultBlock.id });
        requestAnimationFrame(() => {
          const previousBlock = findBlockByIndex(index - 1);
          if (!previousBlock) {
            focusLastBlock();
          } else {
            previousBlock.editable?.focus();
          }
          lastCursor();
        });
      }
    }
    setIsSelectAll(false);
  };

  useEffect(() => {
    console.log('yo');
    ref.current?.focus();
    lastCursor();
  }, []);

  const props = {
    onKeyDown,
    ref,
    html: block.data,
    onChange: (evt) =>
      updateBlockDataWithId({
        id: defaultBlock.id,
        data: evt.target.value,
      }),
  };
  return <Editable {...props} />;
}

TextBlock.type = 'paragraph';

TextBlock.icon = {
  text: 'Text',
  svg: AlignCenter,
};

TextBlock.defaultValue = {
  type: TextBlock.type,
  data: '',
};
