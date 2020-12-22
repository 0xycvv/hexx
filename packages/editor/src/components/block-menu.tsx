import { createElement, Fragment, useMemo } from 'react';
import { useEditor } from '../hooks';
import { isBlockEmpty } from '../utils/blocks';

export type BlockMenuItem = { type: string; config?: any } | string;

export function BlockMenu(props: {
  onAdd?: () => void;
  menu?: BlockMenuItem[];
}) {
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

  const menuList = useMemo(() => {
    if (props.menu) {
      return props.menu.map((item) =>
        typeof item === 'string'
          ? ([item, blockMap[item]] as const)
          : ([
              item.type,
              {
                ...blockMap[item.type],
                block: {
                  ...blockMap[item.type].block,
                  ...item.config,
                },
              },
            ] as const),
      );
    }
    return Object.entries(blockMap);
  }, [props.menu, blockMap]);

  return (
    <>
      {menuList.map(([key, blockType], index) => (
        <Fragment key={`${key}-${index}`}>
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
