import { useUpdateAtom } from 'jotai/utils.cjs';
import { blockIdListAtom, blocksIdMapAtom } from 'src/constants/atom';
import { insert } from 'src/utils/insert';
import { v4 } from 'uuid';

export function useEditor() {
  const updateIdList = useUpdateAtom(blockIdListAtom);
  const updateIdMap = useUpdateAtom(blocksIdMapAtom);

  const insertBlock = ({
    index,
    block,
  }: {
    index?: number;
    block: any;
  }) => {
    let newBlock = {
      ...block,
      id: v4(),
    };
    if (typeof index === 'undefined') {
      updateIdList((s) => [...s, newBlock.id]);
      updateIdMap((s) => ({
        ...s,
        [newBlock.id]: newBlock,
      }));
    } else {
      updateIdMap((s) => ({
        ...s,
        [newBlock.id]: newBlock,
      }));
      updateIdList((s) => insert(s, index, newBlock.id));
    }
  };

  const updateBlockDataWithId = ({
    id,
    data,
  }: {
    id: string;
    data: any;
  }) => {
    updateIdMap((s) => ({
      ...s,
      [id]: {
        ...s[id],
        data,
      },
    }));
  };

  const removeBlockWithId = ({ id }: { id: string }) => {
    updateIdList((s) => s.filter((s) => s !== id));
  };

  const splitBlock = ({
    index,
    block,
    newBlock,
  }: {
    index: number;
    block: any;
    newBlock: any;
  }) => {
    insertBlock({ index: index + 1, block: newBlock });
    updateBlockDataWithId({
      id: block.id,
      data: block.data,
    });
  };

  const clear = (defaultValue?: any) => {
    const value = {
      type: 'paragraph',
      data: '',
      id: v4(),
    };
    updateIdList(() => [value.id]);
    updateIdMap(() => ({ [value.id]: value }));
  };

  return {
    splitBlock,
    insertBlock,
    updateBlockDataWithId,
    removeBlockWithId,
    clear,
  };
}
