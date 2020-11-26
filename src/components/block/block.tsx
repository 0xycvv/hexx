import clsx from 'clsx';
import { useAtom } from 'jotai';
import { useSelector, useUpdateAtom } from 'jotai/utils.cjs';
import { KeyboardEvent, useEffect, useRef } from 'react';
import { styled } from 'src/stitches.config';
import { v4 as uuidv4 } from 'uuid';
import { blocksAtom, isSelectAllAtom } from '../../constants/atom';
import { BackspaceKey, commandKey } from '../../constants/key';
import {
  findBlockByIndex,
  focusLastBlock,
  lastCursor,
} from '../../utils/find-blocks';
import { removeRanges } from '../../utils/remove-ranges';
import { Editable } from '../editable';
import { BlockType } from '../editor';
import DragIndicator from '../icons/drag-indicator';
import PlusSvg from '../icons/plus';

const Menu = styled('div', {
  opacity: 0,
});

const Wrapper = styled('div', {
  width: '100%',
  position: 'relative',
  marginTop: '1px',
  marginBottom: '1px',
  [`:hover ${Menu}`]: {
    opacity: 1,
    transition: 'opacity 20ms ease-in 0s',
  },
});

const Plus = styled('div', {
  userSelect: 'none',
  cursor: 'pointer',
  fontSize: 24,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'rgba(55, 53, 47, 0.3)',
  position: 'absolute',
  top: 3,
  left: '-48px',
  width: 24,
  height: 24,
  borderRadius: 3,
  pointerEvents: 'auto',
});

const Drag = styled('div', {
  userSelect: 'none',
  position: 'absolute',
  top: 3,
  left: '-24px',
  pointerEvents: 'auto',
  cursor: '-webkit-grab',
  borderRadius: 3,
  fontSize: 24,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'rgba(55, 53, 47, 0.3)',
});

const SelectOverlay = styled('div', {
  position: 'absolute',
  pointerEvents: 'none',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(46, 170, 220, 0.2)',
  zIndex: 81,
  opacity: 1,
});


function useBlock({
  block: defaultBlock,
  index,
}: {
  block: BlockType;
  index: number;
}) {
  const block = useSelector(
    blocksAtom,
    (v) => defaultBlock && v.find((b) => b.id === defaultBlock.id),
  );
  const update = useUpdateAtom(blocksAtom);
  const [isSelectAll, setIsSelectAll] = useAtom(isSelectAllAtom);
  const ref = useRef<HTMLDivElement>(null);
  const focusBlock = (index: number) => {
    const event = new CustomEvent('focus-block', {
      detail: {
        index,
      },
      bubbles: true,
    });
    ref.current.dispatchEvent(event);
  };

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

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      let selectedRange = window.getSelection().getRangeAt(0);
      if (selectedRange.startOffset === 0) {
        focusBlock(index - 1);
      }
    }
    if (e.key === 'ArrowDown') {
      let selectedRange = window.getSelection().getRangeAt(0);
      if (
        (selectedRange.commonAncestorContainer as Text)?.length ===
        selectedRange.endOffset
      ) {
        focusBlock(index + 1);
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
        update((s) => s.filter((b) => b.id !== defaultBlock.id));
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
  };

  useEffect(() => {
    ref.current?.focus();
    lastCursor();
  }, []);

  return {
    getBlockProps: () => ({
      'data-block-id': block.id,
      className: clsx('e-block'),
    }),
    getEditableProps: () => ({
      onKeyDown,
      ref,
      html: block.data,
      onChange: (evt) =>
        update((s) =>
          s.map((b) =>
            b.id === defaultBlock.id
              ? { ...b, data: evt.target.value }
              : b,
          ),
        ),
    }),
    isSelectAll,
  };
}

export function Block({
  block,
  index,
}: {
  block: BlockType;
  index: number;
}) {
  const { getBlockProps, getEditableProps, isSelectAll } = useBlock({
    block,
    index,
  });

  return (
    <Wrapper {...getBlockProps()}>
      <Menu>
        <DragButton />
        <PlusButton />
      </Menu>
      <Editable {...getEditableProps()} />
      {isSelectAll && <SelectOverlay />}
    </Wrapper>
  );
}

function DragButton() {
  return (
    <Drag>
      <DragIndicator />
    </Drag>
  );
}

function PlusButton() {
  return (
    <Plus>
      <PlusSvg />
    </Plus>
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
