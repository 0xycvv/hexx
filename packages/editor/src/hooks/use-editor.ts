import { useAtom } from 'jotai';
import { useAtomValue } from 'jotai/utils.cjs';
import { useCallback } from 'react';
import { v4 } from 'uuid';
import {
  blockIdListAtom,
  blockMapAtom,
  blockMapFamily,
  blockSelectAtom,
  blocksIdMapAtom,
  editorDefaultBlockAtom,
  hoverBlockAtom,
  _hexxScope,
} from '../constants/atom';
import { BlockType } from '../utils/blocks';
import { insert, insertArray } from '../utils/insert';
import { useAtomCallback, useUpdateAtom } from '../utils/jotai';
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

export function useBlock<T = any>(id: string, blockIndex: number) {
  const family = blockMapFamily(id);
  family.scope = _hexxScope;
  // @ts-ignore
  const [block, updateBlockIdMap] = useAtom<BlockType<T>>(family);
  const setIds = useUpdateAtom(blockIdListAtom);

  const remove = () => {
    blockMapFamily.remove(id);
    setIds((s) => s.filter((s) => s !== id));
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
    block,
    remove,
    update: updateBlockIdMap,
    registerWithIndex,
    register,
  };
}

export function useIdMap() {
  return useAtom(blocksIdMapAtom);
}

export function useGetBlockCallback() {
  return useAtomCallback(
    useCallback((get, set, arg: { id: string }) => {
      const block = get(blocksIdMapAtom)[arg.id];

      return block;
    }, []),
  );
}

// perf issue
export function useEditor() {
  const hoverBlock = useAtomValue(hoverBlockAtom);
  const blockMap = useAtomValue(blockMapAtom);
  const [blockSelect, setBlockSelect] = useAtom(blockSelectAtom);

  const setIdList = useUpdateAtom(blockIdListAtom);
  const setIdMap = useUpdateAtom(blocksIdMapAtom);

  const lastHoverBlock = usePreviousExistValue(hoverBlock);

  const selectBlock = (id?: string) => {
    setBlockSelect(id ? [id] : []);
  };

  const getBlock = useGetBlockCallback();

  const insertBlockAfter = useAtomCallback(
    useCallback((get, set, arg: { id: string; block: any }) => {
      let newBlock = {
        ...arg.block,
        id: v4(),
      };
      const ids = get(blockIdListAtom);
      const currentBockIndex = ids.findIndex((d) => d === arg.id);
      if (currentBockIndex > -1) {
        setIdList(insert(ids, currentBockIndex + 1, newBlock.id));
        setIdMap((s) => ({
          ...s,
          [newBlock.id]: newBlock,
        }));
      }
      return newBlock;
    }, []),
  );

  const insertBlock = useCallback(
    (arg: { index?: number; block: any }) => {
      let newBlock = {
        ...arg.block,
        id: v4(),
      };
      if (typeof arg.index === 'undefined') {
        setIdList((s) => [...s, newBlock.id]);
        setIdMap((s) => ({
          ...s,
          [newBlock.id]: newBlock,
        }));
      } else {
        setIdList((s) => insert(s, arg.index!, newBlock.id));
        setIdMap((s) => ({
          ...s,
          [newBlock.id]: newBlock,
        }));
      }
      return newBlock;
    },
    [],
  );

  const batchInsertBlocks = useCallback(
    ({ index, blocks }: { index?: number; blocks: any[] }) => {
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
    },
    [],
  );

  const updateBlockDataWithId = useCallback(
    ({ id, data }: { id: string; data: any }) => {
      setIdMap((s) => ({
        ...s,
        [id]: {
          ...s[id],
          data,
        },
      }));
    },
    [],
  );

  const removeBlockWithId = useCallback(({ id }: { id: string }) => {
    setIdList((s) => s.filter((s) => s !== id));
  }, []);

  const batchRemoveBlocks = useCallback(
    ({ ids }: { ids: string[] }) => {
      setIdList((s) => s.filter((s) => !ids.includes(s)));
    },
    [],
  );

  const splitBlock = useCallback(
    ({
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
    },
    [updateBlockDataWithId, insertBlock],
  );

  const clear = useAtomCallback(
    useCallback((get, set, _?: any) => {
      const defaultBlock = get(editorDefaultBlockAtom);
      const value = {
        ...defaultBlock,
        id: v4(),
      };
      setIdList(() => [value.id]);
      setIdMap(() => ({ [value.id]: value }));
    }, []),
  );

  return {
    // method
    setIdList,
    insertBlock,
    insertBlockAfter,
    splitBlock,
    updateBlockDataWithId,
    setIdMap,
    batchRemoveBlocks,
    removeBlockWithId,
    batchInsertBlocks,
    clear,
    getBlock,
    // data
    blockSelect,
    blockMap,
    hoverBlock,
    lastHoverBlock,
    selectBlock,
  };
}
