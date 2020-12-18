import { createElement, Fragment } from 'react';
import { useEditor } from '../hooks';
import { isBlockEmpty } from '../utils/blocks';

export function BlockMenu(props: { onAdd?: () => void }) {
  const {
    blockMap,
    lastHoverBlock,
    insertBlockAfter,
    setIdMap,
    getBlock,
  } = useEditor();

  const handleAddBlock = (blockType) => {
    if (!lastHoverBlock) return;
    const blockToAdd = {
      type: blockType.block.type,
      data: blockType.block.defaultValue,
    };
    getBlock({ id: lastHoverBlock.id }).then((block) => {
      const isEmpty = isBlockEmpty(blockMap[block.type], block.data);
      if (isEmpty) {
        setIdMap((s) => ({
          ...s,
          [lastHoverBlock.id]: {
            id: lastHoverBlock.id,
            ...blockToAdd,
          },
        }));
      } else {
        insertBlockAfter({
          block: {
            type: blockType.block.type,
            data: blockType.block.defaultValue,
          },
          id: lastHoverBlock.id,
        });
      }
      props.onAdd?.();
    });
  };

  return (
    <>
      {Object.entries(blockMap).map(([key, blockType]) => (
        <Fragment key={key}>
          {createElement(blockType.block.icon.svg, {
            title: blockType.block.icon.text,
            tabIndex: 0,
            onKeyPress: (e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddBlock(blockType);
              }
            },
            onClick: () => handleAddBlock(blockType),
          })}
        </Fragment>
      ))}
    </>
  );
}
