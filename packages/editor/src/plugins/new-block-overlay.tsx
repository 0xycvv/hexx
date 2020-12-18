import { styled } from '@hexx/theme';
import { ReactNode } from 'react';
import { useIdMap } from '../hooks';
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
    uiState: [uiState],
    selectAll: [isSelectAll, setIsSelectAll],
    defaultBlock: [defaultBlock],
    editor,
    activeBlock,
  } = usePlugin();

  const [idMap] = useIdMap();

  const {
    blockSelect,
    selectBlock,
    insertBlock,
    getBlock,
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
    if (!activeBlock) {
      const lastBlock = findLastBlock();
      if (lastBlock && lastBlock.blockId) {
        const block = idMap[lastBlock.blockId];

        const blockType = blockMap[block.type];
        if (
          blockType &&
          blockType.block &&
          // @ts-ignore
          typeof blockType.block.isEmpty === 'function' &&
          // @ts-ignore
          blockType.block.isEmpty(block.data)
        ) {
          if (lastBlock?.editable) {
            lastBlock?.editable?.focus();
          } else {
            insertBlock({ block: defaultBlock });
          }
        } else {
          insertBlock({ block: defaultBlock });
        }
      } else {
        insertBlock({ block: defaultBlock });
      }
    } else {
      activeBlock?.editable?.focus();
    }
  };

  return (
    <NewBlockOverlay
      className="hexx-new-block-overlay"
      onClick={handleClick}
    >
      {props.children}
    </NewBlockOverlay>
  );
}
