import { atom, PrimitiveAtom, useAtom } from 'jotai';
import { useAtomCallback, useAtomValue } from 'jotai/utils';
import { useCallback, useEffect, useRef } from 'react';
import { v4 } from 'uuid';
import {
  $hoverAtom,
  BlockAtom,
  blockMapAtom,
  blocksAtom,
  createAtom,
  editorDefaultBlockAtom,
  selectAtom,
  _hexxScope,
} from '../constants/atom';
import { insert, insertArray } from '../utils/array';
import { BlockType } from '../utils/blocks';

export const EditableWeakMap = new WeakMap<
  HTMLDivElement | HTMLElement | Element,
  {
    blockIndex: number;
    index: number;
    id: string;
  }
>();

export function useBlock<T = any>(
  blockAtom: PrimitiveAtom<BlockType<any>>,
  blockIndex: number,
) {
  const [block, setBlock] = useAtom(blockAtom);
  const [, setBlocks] = useAtom(blocksAtom);
  const registeredRef = useRef<Array<any>>();

  const remove = () => {
    setBlocks((s) => s.filter((item) => item !== blockAtom));
  };

  const register = useCallback(
    (ref, index: number = 0) => {
      if (typeof blockIndex === 'undefined') {
        throw new Error(
          'register editable block must provide blockIndex.',
        );
      }
      if (ref) {
        EditableWeakMap.set(ref, { index, id: block.id, blockIndex });
        registeredRef.current?.push(ref);
      }
    },
    [blockIndex],
  );

  const registerByIndex = useCallback(
    (index: number) =>
      useCallback((ref) => {
        register(ref, index);
      }, []),
    [register],
  );

  useEffect(() => {
    return () => {
      const registeredList = registeredRef.current;
      if (registeredList && registeredList.length > 0) {
        for (const registered of registeredList) {
          EditableWeakMap.delete(registered);
        }
      }
    };
  }, []);

  return {
    block,
    remove,
    update: setBlock,
    registerByIndex,
    register,
  };
}

export function useRemoveBlock() {}

export type UseEditorReturn = ReturnType<typeof useEditor>;
export function useEditor() {
  const [hoverBlockAtom] = useAtom($hoverAtom);
  const blockMap = useAtomValue(blockMapAtom);
  const [blockSelect, setBlockSelect] = useAtom(selectAtom);
  const defaultBlock = useAtomValue(editorDefaultBlockAtom);

  const selectBlock = (blockAtom?: BlockAtom | null) => {
    setBlockSelect(blockAtom ? new Set([blockAtom]) : new Set([]));
  };

  const insertBlockAfter = useAtomCallback(
    useCallback(
      (get, set, arg: { atom: BlockAtom; block: any }) => {
        let newBlock = {
          ...arg.block,
          id: v4(),
        };
        const blockData = get(blocksAtom);

        const currentBockIndex = blockData.findIndex(
          (d) => d === arg.atom,
        );
        if (currentBockIndex > -1) {
          set(
            blocksAtom,
            insert(blockData, currentBockIndex + 1, atom(newBlock)),
          );
        }
        return newBlock;
      },
      [blocksAtom],
    ),
    _hexxScope,
  );

  const insertBlock = useAtomCallback(
    useCallback(
      (_, set, arg: { index?: number; block: any }) => {
        let newBlock = createAtom({
          ...arg.block,
          id: v4(),
        });
        if (typeof arg.index === 'undefined') {
          set(blocksAtom, (s) => [...s, newBlock]);
        } else {
          set(blocksAtom, (s) => insert(s, arg.index!, newBlock));
        }
        return newBlock;
      },
      [blocksAtom],
    ),
    _hexxScope,
  );

  const batchInsertBlocks = useAtomCallback(
    useCallback(
      (
        _,
        set,
        { index, blocks }: { index?: number; blocks: any[] },
      ) => {
        let newBlocks = blocks.map((s) => ({ ...s, id: v4() }));
        if (typeof index === 'undefined') {
          set(blocksAtom, (s) => [...s, ...newBlocks]);
        } else {
          set(blocksAtom, (s) => insertArray(s, index, newBlocks));
        }
      },
      [blocksAtom],
    ),
    _hexxScope,
  );

  const replaceBlockById = useAtomCallback(
    useCallback(
      (get, set, { id, block }: { id: string; block: BlockType }) => {
        set(blocksAtom, (s) =>
          s.map((a) => (get(a).id === id ? createAtom(block) : a)),
        );
      },
      [blocksAtom],
    ),
    _hexxScope,
  );

  const removeBlock = useAtomCallback(
    useCallback(
      (_, set, arg: BlockAtom) => {
        set(blocksAtom, (s) => s.filter((b) => b !== arg));
      },
      [blocksAtom],
    ),
    _hexxScope,
  );

  const batchRemoveBlocks = useAtomCallback(
    useCallback((_get, set, arg: BlockAtom[]) => {
      set(blocksAtom, (s) => s.filter((a) => !arg.includes(a)));
    }, []),
    _hexxScope,
  );

  const clear = useAtomCallback(
    useCallback((get, set, _?: any) => {
      const defaultBlock = get(editorDefaultBlockAtom);
      const value = {
        ...defaultBlock,
        id: v4(),
      };
      set(blocksAtom, [createAtom(value)]);
    }, []),
    _hexxScope,
  );

  return {
    // method
    insertBlock,
    insertBlockAfter,
    replaceBlockById,
    batchRemoveBlocks,
    batchInsertBlocks,
    clear,
    removeBlock,
    // data
    defaultBlock,
    blockSelect,
    blockMap,
    hoverBlockAtom,
    // lastHoverBlock,
    selectBlock,
  };
}
