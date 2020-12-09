import { useAtom } from 'jotai';
import { useCallback } from 'react';
import { v4 } from 'uuid';
import { BlockType } from '../components/editor';
import {
  blockIdListAtom,
  blockMapAtom,
  blockSelectAtom,
  blocksIdMapAtom,
  hoverBlockAtom,
} from '../constants/atom';
import { insert, insertArray } from '../utils/insert';
import { normalize } from '../utils/normalize';
import { usePreviousExistValue } from './use-previous-exist-value';

export const EditableMap = new WeakMap<
  HTMLDivElement,
  {
    blockIndex: number;
    index: number;
    id: string;
  }
>();

export function useBlock(id: string, blockIndex?: number) {
  const {
    removeBlockWithId,
    updateBlockDataWithId,
    IdMap,
  } = useEditor();
  const remove = () => {
    removeBlockWithId({ id });
  };

  const update = (block) => {
    if (typeof block === 'function') {
      updateBlockDataWithId(block);
    } else {
      updateBlockDataWithId({ id, data: block });
    }
  };

  const register = useCallback(
    (ref, index: number = 0) => {
      if (typeof blockIndex === 'undefined') {
        throw new Error(
          'register editable block must provide blockIndex.',
        );
      }
      if (ref) {
        EditableMap.set(ref, { index, id, blockIndex });
      }
    },
    [blockIndex],
  );

  const registerWithIndex = useCallback(
    (index: number) =>
      useCallback((ref) => {
        register(ref, index);
      }, []),
    [register],
  );

  return {
    block: IdMap[id],
    remove,
    update,
    registerWithIndex,
    register,
  };
}

export function useEditor() {
  const [hoverBlock] = useAtom(hoverBlockAtom);
  const [blockMap] = useAtom(blockMapAtom);
  const [blockSelect, setBlockSelect] = useAtom(blockSelectAtom);
  const [idList, setIdList] = useAtom(blockIdListAtom);
  const [IdMap, setIdMap] = useAtom(blocksIdMapAtom);
  const lastHoverBlock = usePreviousExistValue(hoverBlock);
  const findBlockIndexById = (id?: string) => {
    return idList.findIndex((d) => d === id);
  };

  const selectBlock = (id?: string) => {
    setBlockSelect(id ? [id] : []);
  };

  const insertBlockAfter = ({
    id,
    block,
  }: {
    id: string;
    block: any;
  }) => {
    let newBlock = {
      ...block,
      id: v4(),
    };
    const currentBockIndex = findBlockIndexById(id);
    if (currentBockIndex > -1) {
      setIdList(insert(idList, currentBockIndex + 1, newBlock.id));
      setIdMap((s) => ({
        ...s,
        [newBlock.id]: newBlock,
      }));
    }
  };

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
      setIdList((s) => [...s, newBlock.id]);
      setIdMap((s) => ({
        ...s,
        [newBlock.id]: newBlock,
      }));
    } else {
      setIdMap((s) => ({
        ...s,
        [newBlock.id]: newBlock,
      }));
      setIdList((s) => insert(s, index, newBlock.id));
    }
  };

  const batchInsertBlocks = ({
    index,
    blocks,
  }: {
    index?: number;
    blocks: any[];
  }) => {
    let newBlocks: BlockType[] = [];
    for (const block of blocks) {
      newBlocks.push({
        id: v4(),
        ...block,
      });
    }
    const { byId, ids } = normalize(newBlocks, 'id');
    if (typeof index === 'undefined') {
      setIdList((s) => [...s, ...ids]);
      setIdMap((s) => ({
        ...s,
        ...byId,
      }));
    } else {
      setIdList((s) => insertArray(s, index, ids));
      setIdMap((s) => ({
        ...s,
        ...byId,
      }));
    }
  };

  const updateBlockDataWithId = ({
    id,
    data,
  }: {
    id: string;
    data: any;
  }) => {
    setIdMap((s) => ({
      ...s,
      [id]: {
        ...s[id],
        data,
      },
    }));
  };

  const removeBlockWithId = ({ id }: { id: string }) => {
    setIdList((s) => s.filter((s) => s !== id));
  };

  const batchRemoveBlocks = ({ ids }: { ids: string[] }) => {
    setIdList((s) => s.filter((s) => !ids.includes(s)));
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
    setIdList(() => [value.id]);
    setIdMap(() => ({ [value.id]: value }));
  };

  return {
    // method
    setIdList,
    findBlockIndexById,
    insertBlock,
    insertBlockAfter,
    splitBlock,
    updateBlockDataWithId,
    setIdMap,
    batchRemoveBlocks,
    removeBlockWithId,
    batchInsertBlocks,
    clear,
    // data
    blockSelect,
    blockMap,
    hoverBlock,
    lastHoverBlock,
    selectBlock,
    idList,
    IdMap,
  };
}
