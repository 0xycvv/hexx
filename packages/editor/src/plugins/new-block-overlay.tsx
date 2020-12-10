import { styled } from '@hexx/theme';
import { ReactNode } from 'react';
import { useActiveBlockId } from '../hooks/use-active-element';
import { findLastBlock } from '../utils/find-blocks';
import { usePlugin } from './plugin';

const NewBlockOverlay = styled('div', {
  position: 'absolute',
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
});

export function NewBlockOverlayPlugin(props: {
  children?: ReactNode;
}) {
  const {
    editor,
    uiState: [uiState],
    selectAll: [isSelectAll, setIsSelectAll],
    defaultBlock,
  } = usePlugin();
  const active = useActiveBlockId();
  const {
    blockSelect,
    selectBlock,
    insertBlock,
    idMap,
    blockMap,
  } = editor;
  const handleClick = () => {
    if (
      blockSelect.length > 0 &&
      !uiState.isDragging &&
      !uiState.isSorting
    ) {
      selectBlock();
      return;
    }
    if (isSelectAll) {
      setIsSelectAll(false);
    }
    if (!active) {
      const lastBlock = findLastBlock();
      if (lastBlock && lastBlock.blockId) {
        const block = idMap[lastBlock.blockId];
        const blockType = blockMap[block.type];
        if (
          (blockType.block &&
            // @ts-ignore
            typeof blockType.block.isEmpty === 'function' &&
            // @ts-ignore
            blockType.block.isEmpty(block.data))
        ) {
          lastBlock?.editable?.focus();
        } else {
          insertBlock({ block: defaultBlock });
        }
      } else {
        insertBlock({ block: defaultBlock });
      }
    } else {
      active?.editable?.focus();
    }
  };
  return (
    <NewBlockOverlay
      className="hexx-block-overlay"
      onClick={handleClick}
    >
      {props.children}
    </NewBlockOverlay>
  );
}
