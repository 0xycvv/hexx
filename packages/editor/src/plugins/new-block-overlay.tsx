import { styled } from '@hexx/theme';
import { useAtom } from 'jotai';
import { useAtomCallback } from 'jotai/utils';
import { ReactNode, useCallback } from 'react';
import { $lastBlockAtom, _hexxScope } from '../constants/atom';
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

  const [lastBlock] = useAtom($lastBlockAtom);

  const { blockSelect, selectBlock, insertBlock, blockMap } = editor;

  const handleClick = useAtomCallback(
    useCallback(
      (get) => {
        if (
          blockSelect.size > 0 &&
          !uiState.isDragging &&
          !uiState.isSorting
        ) {
          // reset the selection
          selectBlock();
          return;
        }
        if (isSelectAll) {
          setIsSelectAll(false);
        }
        // add a new block
        if (!activeBlock) {
          if (lastBlock) {
            const lastBlockType = get(lastBlock);

            if (!lastBlockType) {
              return;
            }
            const blockType = blockMap[lastBlockType.type];

            if (
              blockType &&
              blockType.block &&
              typeof blockType.block.isEmpty === 'function' &&
              blockType.block.isEmpty(lastBlockType.data)
            ) {
              const lastBlock = findLastBlock();
              if (lastBlock?.editable) {
                lastBlock.editable.focus();
                // focusWithLastCursor(lastBlock.editable, true);
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
      },
      [lastBlock],
    ),
    _hexxScope,
  );

  return (
    <NewBlockOverlay
      className="hexx-new-block-overlay"
      onClick={handleClick}
    >
      {props.children}
    </NewBlockOverlay>
  );
}
