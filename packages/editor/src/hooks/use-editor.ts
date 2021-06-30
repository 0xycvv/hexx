import { atom, PrimitiveAtom, SetStateAction, useAtom } from 'jotai';
import { useAtomCallback, useAtomValue } from 'jotai/utils';
import { useCallback } from 'react';
import { v4 } from 'uuid';
import { BlockData } from '../../../renderer/src/types';
import {
  $hoverAtom,
  BlockAtom,
  blocksAtom,
  blockScopeAtom,
  createAtom,
  editorDefaultBlockAtom,
  selectAtom,
  _hexxScope,
} from '../constants/atom';
import { insert, insertArray } from '../utils/array';
import { BlockType } from '../utils/blocks';
import { findBlockById } from '../utils/find-blocks';
import { extractFragmentFromPosition } from '../utils/ranges';

export function useBlock<T = unknown>(
  blockAtom: PrimitiveAtom<BlockType<T>>,
) {
  const [block, setBlock] = useAtom(blockAtom);
  const [, setBlocks] = useAtom(blocksAtom);

  const remove = () => {
    setBlocks((s) => s.filter((item) => item !== blockAtom));
  };

  return {
    block,
    remove,
    update: setBlock,
  };
}

function newBlockOnMount(id: string) {
  requestAnimationFrame(() => {
    const blockEl = findBlockById(id, true);
    blockEl?.editable?.focus();
  });
}

export type UseEditorReturn = ReturnType<typeof useEditor>;
export function useEditor() {
  const [hoverBlockAtom] = useAtom($hoverAtom);
  const blockScope = useAtomValue(blockScopeAtom);
  const [blockSelect, setBlockSelect] = useAtom(selectAtom);
  const defaultBlock = useAtomValue(editorDefaultBlockAtom);

  const selectBlock = (blockAtom?: BlockAtom | null) => {
    setBlockSelect(blockAtom ? new Set([blockAtom]) : new Set([]));
  };

  const splitBlock = useAtomCallback(
    useCallback(
      (
        get,
        set,
        {
          atom,
          updater,
        }: { atom: BlockAtom; updater: SetStateAction<any> },
      ) => {
        const fragment = extractFragmentFromPosition();

        if (!fragment) {
          return;
        }

        const { current, next } = fragment;
        const currentBlock = get(atom);
        set(atom, (s) => ({
          ...s,
          data: {
            ...s.data,
            ...updater(current),
          },
        }));
        insertBlockAfter({
          atom,
          block: {
            type: currentBlock.type,
            data: {
              ...currentBlock.data,
              ...updater(next),
            },
          },
        });
      },
      [],
    ),
    _hexxScope,
  );

  const insertBlockAfter = useAtomCallback(
    useCallback(
      (get, set, arg: { atom: BlockAtom; block: BlockData }) => {
        let newBlock: BlockType = {
          ...arg.block,
          id: v4(),
        };
        const blockData = get(blocksAtom);

        const currentBockIndex = blockData.findIndex(
          (d) => d === arg.atom,
        );
        if (currentBockIndex > -1) {
          const newBlockAtom = atom(newBlock);
          newBlockAtom.scope = _hexxScope;
          newBlockAtom.onMount = () => {
            newBlockOnMount(newBlock.id);
          };
          set(
            blocksAtom,
            insert(blockData, currentBockIndex + 1, newBlockAtom),
          );
          return newBlockAtom;
        }
      },
      [blocksAtom],
    ),
    _hexxScope,
  );

  const insertBlock = useAtomCallback(
    useCallback(
      (_, set, arg: { index?: number; block: BlockData }) => {
        const id = v4();
        let newBlock = atom({
          ...arg.block,
          id,
        });
        newBlock.scope = _hexxScope;
        newBlock.onMount = () => {
          newBlockOnMount(id);
        };
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
        let newBlocks = blocks.map((s) =>
          createAtom({ ...s, id: v4() }),
        );
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
    splitBlock,
    clear,
    removeBlock,
    // data
    defaultBlock,
    blockSelect,
    blockScope,
    hoverBlockAtom,
    // lastHoverBlock,
    selectBlock,
  };
}
