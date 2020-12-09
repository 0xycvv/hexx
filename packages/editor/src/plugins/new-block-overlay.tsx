import { styled } from '@hexx/theme';
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

export function NewBlockOverlayPlugin() {
  const {
    editor,
    uiState: [uiState],
    selectAll: [isSelectAll, setIsSelectAll],
    defaultBlock,
  } = usePlugin();
  const active = useActiveBlockId();
  const { blockSelect, selectBlock, insertBlock } = editor;
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
      if (lastBlock) {
        if (lastBlock.editable) {
          if ((lastBlock?.editable?.textContent?.length ?? 0) > 0) {
            insertBlock({
              block: defaultBlock,
            });
            lastBlock.editable?.focus();
          } else {
            lastBlock.editable?.focus();
          }
        } else {
          insertBlock({
            block: defaultBlock,
          });
        }
      }
    } else {
      active?.editable?.focus();
    }
  };
  return <NewBlockOverlay onClick={handleClick} />;
}
