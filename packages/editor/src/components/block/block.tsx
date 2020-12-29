import { styled } from '@hexx/theme';
import { useAtom } from 'jotai';
import {
  createElement,
  KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { SortableElement, SortableHandle } from 'react-sortable-hoc';
import {
  blockMapFamily,
  blockSelectAtom,
  dropBlockAtom,
  editorIdAtom,
  hoverBlockAtom,
  isEditorSelectAllAtom,
  isHoveringFamily,
  _hexxScope,
} from '../../constants/atom';
import { BackspaceKey, commandKey } from '../../constants/key';
import { useEditor } from '../../hooks/use-editor';
import { BlockProps } from '../../utils/blocks';
import {
  findBlockByIndex,
  findContentEditable,
  focusContentEditable,
  focusLastBlock,
  lastCursor,
} from '../../utils/find-blocks';
import {
  extractFragmentFromPosition,
  getSelectionRange,
  isEditableSelectAll,
  removeRanges,
} from '../../utils/ranges';
import { TextBlock } from './text';

const Wrapper = styled('div', {
  width: '100%',
  position: 'relative',
  marginTop: '1px',
  marginBottom: '1px',
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
  id,
  index,
}: {
  id: string;
  index: number;
}) {
  const { removeBlockById, splitBlock, blockMap } = useEditor();
  const [editorId] = useAtom(editorIdAtom);
  const [hoverBlockId, setHoverBlockId] = useAtom(hoverBlockAtom);
  const [isEditorSelectAll, setIsEditorSelectAll] = useAtom(
    isEditorSelectAllAtom,
  );
  const [blockSelect, setBlockSelect] = useAtom(blockSelectAtom);
  const ref = useRef<HTMLDivElement>(null);
  const selectInputRef = useRef<HTMLInputElement>(null);
  const family = blockMapFamily(id);
  family.scope = _hexxScope;
  const [block] = useAtom<any>(family);
  const isHoverFamily = isHoveringFamily(id);
  isHoverFamily.scope = _hexxScope;
  const [isHovering, setHovering] = useAtom(isHoveringFamily(id));
  const currentBlock = block && blockMap[block.type];
  const isBlockSelect = blockSelect.includes(block.id);
  const [drop] = useAtom(dropBlockAtom);

  const isDropping = drop === id;

  const onKeyDown = (e: KeyboardEvent) => {
    setHoverBlockId(null);
    if (e.key === 'ArrowUp') {
      const range = getSelectionRange();
      if (!range) {
        return;
      }
      if (range.startOffset === 0) {
        focusContentEditable('up');
      }
    }
    if (e.key === 'ArrowDown') {
      const range = getSelectionRange();
      if (!range) {
        return;
      }
      if (
        !(range.commonAncestorContainer as Text)?.length ||
        ((range.commonAncestorContainer as Text)?.length ===
          range.endOffset &&
          range.collapsed)
      ) {
        focusContentEditable('down');
      }
    }
    if (!e.shiftKey && e.key === 'Enter') {
      const fragment = extractFragmentFromPosition();

      if (!fragment) {
        return;
      }

      const { current, next } = fragment;
      splitBlock({
        index,
        id,
        block: {
          ...block,
          data: {
            ...block.data,
            text: current,
          },
        },
        newBlock: {
          type: TextBlock.block.type,
          data: {
            ...TextBlock.block.defaultValue,
            text: next,
          },
        },
      });
      e.preventDefault();
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
        removeBlockById({ id: block.id });
        setBlockSelect([]);
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

  const setHoverId = useCallback(() => {
    setHovering({
      id: block.id,
      el: ref.current!,
    });
  }, [block.id, ref.current]);

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
      onFocus: setHoverId,
      onBlur: () => {
        setHoverBlockId(null);
      },
      onMouseEnter: setHoverId,
      onClick: (e) => {
        if (!ref.current) return;
        const editable = findContentEditable(ref.current);
        if (!editable) {
          setBlockSelect([block.id]);
          e.stopPropagation();
        }
        setHoverId();
      },
    },
    isBlockSelect,
    isEditorSelectAll,
    setIsBlockSelect: (value: boolean) => {
      setBlockSelect(value ? [block.id] : []);
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
    isDropping,
  }) => {
    return (
      <div className="hexx-block">
        {createElement(blockComponent, {
          id,
          index: i,
          css: blockComponent.block.css,
          config: blockComponent.block.config,
        })}
        {(isBlockSelect || isEditorSelectAll) && (
          <SortableOverlay selectInputRef={selectInputRef} />
        )}
        <BottomIndicator
          className="hexx-bottom-indicator"
          drop={isDropping && 'active'}
        />
        <RightIndicator className="hexx-right-indicator" />
      </div>
    );
  },
);

export function Block({ id, index, css }: BlockProps) {
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
    id,
    index,
  });

  if (!blockComponent) {
    return null;
  }

  return (
    <Wrapper css={css} ref={ref} {...getBlockProps}>
      <SortableItem
        selectInputRef={selectInputRef}
        isBlockSelect={isBlockSelect}
        isEditorSelectAll={isEditorSelectAll}
        id={block.id}
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
