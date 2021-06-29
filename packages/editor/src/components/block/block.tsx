import { CSS, styled } from '@hexx/theme';
import { PrimitiveAtom, useAtom } from 'jotai';
import {
  createElement,
  KeyboardEvent,
  useEffect,
  useRef,
} from 'react';
import { SortableElement, SortableHandle } from 'react-sortable-hoc';
import {
  $hoverAtom,
  blockSelectAtom,
  dropAtom,
  editorIdAtom,
  isEditorSelectAllAtom,
} from '../../constants/atom';
import { BackspaceKey, commandKey } from '../../constants/key';
import { useEditor } from '../../hooks/use-editor';
import { BlockType } from '../../utils/blocks';
import {
  findBlockByIndex,
  findInputs,
  focusContentEditable,
  focusLastBlock,
  lastCursor,
} from '../../utils/find-blocks';
import {
  getSelectionRange,
  isEditableSelectAll,
  removeRanges,
} from '../../utils/ranges';

const Wrapper = styled('div', {
  width: '100%',
  position: 'relative',
  marginTop: '1px',
  marginBottom: '1px',
  '.hexx-block-selecting-overlay': {
    display: 'none',
  },
  '&.selecting': {
    userSelect: 'none',
  },
  '&.selecting .hexx-block-selecting-overlay': {
    display: 'block',
  },
  variants: {
    selected: {
      true: {
        userSelect: 'none',
      },
    },
  },
});

const RightIndicator = styled('div', {
  height: '100%',
  width: 0,
  position: 'absolute',
  right: 0,
  bottom: 0,
  top: 0,
  zIndex: 9,
});

const BottomIndicator = styled('div', {
  height: 0,
  width: '100%',
  position: 'absolute',
  right: 0,
  bottom: 0,
  left: 0,
  zIndex: 9,
  variants: {
    drop: {
      active: {
        background: 'rgba(46, 170, 220, 0.5)',
        left: 0,
        right: 0,
        bottom: '-4px',
        height: 4,
      },
    },
  },
});

const SelectOverlay = styled('div', {
  position: 'absolute',
  userSelect: 'none',
  borderRadius: 4,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: '$success',
  zIndex: 1,
  opacity: 0.2,
  cursor: 'grab',
});

function useBlockWrapper({
  blockAtom,
  index,
}: {
  blockAtom: PrimitiveAtom<BlockType<any>>;
  index: number;
}) {
  const { removeBlock, blockScope, insertBlock } = useEditor();
  const [editorId] = useAtom(editorIdAtom);
  const [isEditorSelectAll, setIsEditorSelectAll] = useAtom(
    isEditorSelectAllAtom,
  );
  const [blockSelect, setBlockSelect] = useAtom(blockSelectAtom);
  const ref = useRef<HTMLDivElement>(null);
  const selectInputRef = useRef<HTMLInputElement>(null);
  const [block, setBlock] = useAtom(blockAtom);
  const [hoverBlock, setHoverBlock] = useAtom($hoverAtom);

  const isHovering = hoverBlock === blockAtom;
  const currentBlock = block && blockScope[block.type];

  const isBlockSelect = blockSelect.has(blockAtom);
  const [drop] = useAtom(dropAtom);

  const isDropping = drop === blockAtom;

  const onKeyDown = (e: KeyboardEvent) => {
    setHoverBlock(null);
    if (e.key === 'ArrowUp') {
      const range = getSelectionRange();
      if (!range) {
        return;
      }
      if (!range.commonAncestorContainer.previousSibling) {
        e.preventDefault();
        focusContentEditable('up', range.startOffset);
      }
    }
    if (e.key === 'ArrowDown') {
      const range = getSelectionRange();
      if (!range) {
        return;
      }
      if (!range.commonAncestorContainer.nextSibling) {
        e.preventDefault();
        focusContentEditable('down', range.startOffset);
      }
    }
    if (e[commandKey] && e.key === 'a') {
      if (isEditorSelectAll) {
        e.preventDefault();
      }
      if (isEditableSelectAll()) {
        setIsEditorSelectAll(true);
        removeRanges();
        e.preventDefault();
      }
      return;
    }
    if (e.key === BackspaceKey) {
      const range = getSelectionRange();
      if (range?.collapse && range.startOffset === 0) {
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
      if (
        ((typeof currentBlock.block.isEmpty === 'function' &&
          currentBlock.block.isEmpty(block.data)) ||
          Object.keys(block.data).length === 0 ||
          isBlockSelect) &&
        index !== 0
      ) {
        removeBlock(blockAtom);
        setBlockSelect(new Set());
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
    setIsEditorSelectAll(false);
  };

  useEffect(() => {
    if (isBlockSelect) {
      selectInputRef.current?.focus();
    }
  }, [isBlockSelect]);

  if (!currentBlock) {
    console.error(`missing block type ${block.type}`);
  }

  const setHover = () => {
    setHoverBlock(blockAtom);
  };

  return {
    block,
    ref,
    selectInputRef,
    editorId,
    isHovering,
    blockComponent: currentBlock,
    getBlockProps: {
      'data-block-id': block.id,
      className: 'hexx-block-wrapper',
      onKeyDown,
      onBlur: () => {
        setHoverBlock(null);
      },
      onMouseEnter: setHover,
      onClick: (e) => {
        if (!ref.current) return;
        const inputs = findInputs(ref.current);
        if (!inputs?.length) {
          setBlockSelect(new Set([block.id]));
          e.stopPropagation();
        } else {
          setBlockSelect(new Set([]));
        }
        setHover();
      },
    },
    isBlockSelect,
    isEditorSelectAll,
    setIsBlockSelect: (value: boolean) => {
      setBlockSelect(value ? new Set([block.id]) : new Set());
    },
    isDropping,
  };
}

const SortableItem = SortableElement(
  ({
    blockComponent,
    isBlockSelect,
    isEditorSelectAll,
    selectInputRef,
    id,
    i,
    blockAtom,
    isDropping,
  }) => {
    const isSelected = isBlockSelect || isEditorSelectAll;
    return (
      <div className="hexx-block">
        {createElement(blockComponent, {
          id,
          index: i,
          blockAtom,
          css: blockComponent.block.css,
          config: blockComponent.block.config,
        })}
        {isSelected && (
          <SortableOverlay selectInputRef={selectInputRef} />
        )}
        <SelectOverlay className="hexx-block-selecting-overlay" />
        <BottomIndicator
          className="hexx-bottom-indicator"
          drop={isDropping && 'active'}
        />
        <RightIndicator className="hexx-right-indicator" />
      </div>
    );
  },
);

export function Block({
  blockAtom,
  index,
  css,
}: {
  index: number;
  blockAtom: PrimitiveAtom<BlockType<any>>;
  css?: CSS;
}) {
  const {
    block,
    selectInputRef,
    getBlockProps,
    isBlockSelect,
    isEditorSelectAll,
    blockComponent,
    ref,
    isDropping,
  } = useBlockWrapper({
    blockAtom,
    index,
  });

  if (!blockComponent) {
    return null;
  }

  const isSelected = isBlockSelect || isEditorSelectAll;

  return (
    <Wrapper
      css={css}
      ref={ref}
      {...getBlockProps}
      selected={isSelected}
    >
      <SortableItem
        selectInputRef={selectInputRef}
        isBlockSelect={isBlockSelect}
        isEditorSelectAll={isEditorSelectAll}
        id={block.id}
        blockAtom={blockAtom}
        blockComponent={blockComponent}
        index={index}
        i={index}
        isDropping={isDropping}
      />
    </Wrapper>
  );
}

const SortableOverlay = SortableHandle(({ selectInputRef }) => (
  <SelectOverlay className="hexx-block-overlay">
    <input ref={selectInputRef} autoFocus style={{ opacity: 0 }} />
  </SelectOverlay>
));
