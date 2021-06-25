import { useAtom } from 'jotai';
import { createElement, Fragment, useMemo } from 'react';
import { BlockAtom } from '../constants/atom';
import { useEditor } from '../hooks';
import { BlockType, isBlockEmpty } from '../utils/blocks';

export type BlockMenuItem = { type: string; config?: any } | string;

export function BlockMenu(props: {
  onAdd?: () => void;
  menu?: BlockMenuItem[];
  blockAtom: BlockAtom;
}) {
  const { blockMap, insertBlockAfter } = useEditor();
  const [block, setBlock] = useAtom(props.blockAtom);

  const handleAddBlock = (blockType: BlockType) => {
    if (!block) return;
    const blockToAdd = {
      type: blockType.type,
      // @ts-ignore
      data: blockType.defaultValue,
    };
    if (isBlockEmpty(blockMap[block.type], block.data)) {
      setBlock((s) => ({ ...s, ...blockToAdd }));
    } else {
      insertBlockAfter({
        block: blockToAdd,
        atom: props.blockAtom,
      });
    }
    props.onAdd?.();
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
                handleAddBlock(blockType.block);
              }
            },
            onClick: () => handleAddBlock(blockType.block),
          })}
        </Fragment>
      ))}
    </>
  );
}
