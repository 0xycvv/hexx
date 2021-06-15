import { styled } from '@hexx/theme';
import { useAtom } from 'jotai';
import { useAtomCallback } from 'jotai/utils';
import { ReactNode, useCallback } from 'react';
import {
  $lastBlockAtom,
  blocksAtom,
  blocksDataAtom,
  _hexxScope,
} from '../constants/atom';
import { focusLastBlock } from '../utils/find-blocks';
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

            console.log(
              blockType.block,
              blockType &&
                blockType.block &&
                typeof blockType.block.isEmpty === 'function' &&
                blockType.block.isEmpty(lastBlockType.data),
            );

            if (
              blockType &&
              blockType.block &&
              typeof blockType.block.isEmpty === 'function' &&
              blockType.block.isEmpty(lastBlockType.data)
            ) {
              focusLastBlock(true);
              // TODO:
              // if (lastBlock?.editable) {
              //   lastBlock?.editable?.focus();
              // } else {
              //   insertBlock({ block: defaultBlock });
              // }
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
