import { useAtom } from 'jotai';
import { createElement, Fragment, useMemo } from 'react';
import { BlockAtom } from '../constants/atom';
import { useEditor } from '../hooks';
import { BlockType, isBlockEmpty } from '../utils/blocks';

export type BlockMenuItem = {
  type: string;
  defaultValue?: any;
  icon: { text: string; svg: any };
};

export function BlockMenu(props: {
  onAdd?: () => void;
  menu: BlockMenuItem[];
  blockAtom: BlockAtom;
}) {
  const { blockScope, insertBlockAfter } = useEditor();
  const [block, setBlock] = useAtom(props.blockAtom);

  const handleAddBlock = (blockType: BlockType) => {
    if (!block) return;
    const blockToAdd = {
      type: blockType.type,
      data: blockType.data,
    };
    if (isBlockEmpty(blockScope[block.type], block.data)) {
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
    return props.menu.map(
      (item) =>
        [
          item,
          {
            ...blockScope[item.type],
            block: {
              ...blockScope[item.type].block,
              data: {
                ...blockScope[item.type].block.defaultValue,
                ...item.defaultValue,
              },
            },
          },
        ] as const,
    );
  }, [props.menu, blockScope]);

  return (
    <>
      {menuList.map(([menuItem, blockType], index) => (
        <Fragment key={`${menuItem.type}-${index}`}>
          {createElement(menuItem.icon.svg, {
            title: menuItem.icon.text,
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
