import { StitchesCssProp, styled } from '@hexx/theme';
import { useAtom } from 'jotai';
import {
  createElement,
  KeyboardEvent,
  ReactNode,
  useEffect,
  useRef,
} from 'react';
import {
  blockMapAtom,
  blockSelectAtom,
  editorIdAtom,
  hoverBlockAtom,
  isEditorSelectAllAtom,
} from '../../constants/atom';
import { BackspaceKey, commandKey } from '../../constants/key';
import { SortableHandle } from 'react-sortable-hoc';
import { useEditor } from '../../hooks/use-editor';
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
  removeRanges,
} from '../../utils/ranges';
import { isEditableSelectAll } from '../editable';
import { BlockType } from '../editor';
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

const SelectOverlay = styled('div', {
  position: 'absolute',
  borderRadius: 4,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: '$success',
  zIndex: 1,
  opacity: 0.2,
  cursor: 'grab'
});

function useBlockWrapper({
  block,
  index,
}: {
  block: BlockType;
  index: number;
}) {
  const { removeBlockWithId, splitBlock } = useEditor();
  const [blocksMap] = useAtom(blockMapAtom);
  const [editorId] = useAtom(editorIdAtom);
  const [hoverBlockId, setHoverBlockId] = useAtom(hoverBlockAtom);
  const [isEditorSelectAll, setIsEditorSelectAll] = useAtom(
    isEditorSelectAllAtom,
  );
  const [blockSelect, setBlockSelect] = useAtom(blockSelectAtom);
  const ref = useRef<HTMLDivElement>(null);
  const selectInputRef = useRef<HTMLInputElement>(null);

  const isHovering =
    hoverBlockId && block && hoverBlockId.id === block.id;
  const currentBlock = block && blocksMap[block.type];
  const isBlockSelect = blockSelect === index;

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
      // TODO: handle if caret on start
      if (
        ((typeof currentBlock.block.isEmpty === 'function' &&
          currentBlock.block.isEmpty(block.data)) ||
          Object.keys(block.data).length === 0 ||
          isBlockSelect) &&
        index !== 0
      ) {
        removeBlockWithId({ id: block.id });
        setBlockSelect(-1);
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

  return {
    ref,
    selectInputRef,
    editorId,
    isHovering,
    blockComponent: currentBlock,
    getBlockProps: () => ({
      'data-block-id': block.id,
      className: 'e-block',
      onKeyDown,
      onFocus: () => {
        setHoverBlockId({
          id: block.id,
          el: ref.current!,
        });
      },
      onBlur: () => {
        setHoverBlockId(null);
      },
      onMouseMove: () => {
        setHoverBlockId({
          id: block.id,
          el: ref.current!,
        });
      },
      onClick: (e) => {
        if (!ref.current) return;
        const editable = findContentEditable(ref.current);
        if (!editable) {
          setBlockSelect(index);
          e.stopPropagation();
        }
        setHoverBlockId({
          id: block.id,
          el: ref.current,
        });
      },
    }),
    isBlockSelect,
    isEditorSelectAll,
    setIsBlockSelect: (value: boolean) => {
      setBlockSelect(value ? index : -1);
    },
  };
}

export interface BlockProps<T = any, C = any> {
  block: BlockType<T>;
  index: number;
  config?: C;
  children?: ReactNode;
  css?: StitchesCssProp;
}
export function Block({ block, index, children, css }: BlockProps) {
  const {
    selectInputRef,
    getBlockProps,
    isBlockSelect,
    isEditorSelectAll,
    blockComponent,
    ref,
  } = useBlockWrapper({
    block,
    index,
  });

  if (!blockComponent) {
    return null;
  }

  return (
    <Wrapper
      css={css}
      ref={ref}
      // style={{
      //   cursor: !isBlockSelect ? 'auto' : 'grab',
      // }}
      {...getBlockProps()}
    >
      {createElement(blockComponent, {
        block,
        index,
        config: blockComponent.block.config,
      })}
      {children}
      {(isBlockSelect || isEditorSelectAll) && (
        <SortableOverlay selectInputRef={selectInputRef} />
      )}
      <RightIndicator className="hexx-right-indicator" />
    </Wrapper>
  );
}

const SortableOverlay = SortableHandle(({ selectInputRef }) => (
  <SelectOverlay>
    <input ref={selectInputRef} autoFocus style={{ opacity: 0 }} />
  </SelectOverlay>
));
