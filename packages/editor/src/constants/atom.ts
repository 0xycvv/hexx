import { atom, PrimitiveAtom } from 'jotai';
import { atomWithReset } from 'jotai/utils';
import { SetStateAction } from 'react';
import { BlockComponent, BlockType } from '../utils/blocks';

export type BlockAtom<T = any> = PrimitiveAtom<BlockType<T>>;

export const _hexxScope = Symbol();

// @ts-ignore
export const createAtom: typeof atom = (...arg) => {
  // @ts-ignore
  const createdAtom = atom(...arg);
  createdAtom.scope = _hexxScope;
  return createdAtom;
};

export const _blocksAtom = atom<BlockAtom[]>([]);
_blocksAtom.scope = _hexxScope;

export const blocksAtom = atom(
  (get) => get(_blocksAtom),
  (get, set, arg: SetStateAction<BlockAtom<any>[]>) => {
    const oldValue = get(_blocksAtom);
    set(_blocksAtom, arg);
    const newValue = get(_blocksAtom);
    updateHistory({
      label: `${JSON.stringify(oldValue)} -> ${JSON.stringify(
        newValue,
      )}`,
      undo: () => {
        set(_blocksAtom, oldValue);
      },
      redo: () => {
        set(_blocksAtom, newValue);
      },
    });
  },
);

blocksAtom.debugLabel = 'BlockData';
blocksAtom.scope = _hexxScope;

export const blocksDataAtom = atom((get) => {
  const blocks = get(blocksAtom);
  return blocks.map((b) => get(b));
});
blocksDataAtom.scope = _hexxScope;

export const blocksIdsAtom = atom((get) => {
  const blocks = get(blocksDataAtom);
  return blocks.map((b) => b.id);
});
blocksIdsAtom.scope = _hexxScope;

export const $lastBlockAtom = atom((get) => {
  const blocks = get(blocksAtom);
  return blocks[blocks.length - 1];
});

$lastBlockAtom.scope = _hexxScope;

export const $hoverAtom = atom<BlockAtom | null>(null);

$hoverAtom.scope = _hexxScope;

let lastExistedHover: BlockAtom<any> | null;

export const $lastHoverAtom = atom(
  (get) => {
    const hoverBlock = get($hoverAtom);
    if (hoverBlock) {
      lastExistedHover = hoverBlock;
      return hoverBlock;
    }
    return hoverBlock || lastExistedHover;
  },
  // (_get, set, arg: SetStateAction<BlockAtom<any> | null>) =>
  //   set($hoverAtom, arg),
);

$lastHoverAtom.scope = _hexxScope;

export const dropAtom = atomWithReset<
  BlockAtom | PrimitiveAtom<null>
>(atom(null));
dropAtom.scope = _hexxScope;

export const selectAtom = atom<Set<BlockAtom>>(new Set([]));
selectAtom.scope = _hexxScope;

export const selectDataAtom = atom((get) => {
  const selectBlocks = get(selectAtom);
  return [...selectBlocks].map((s) => get(s));
});

// editor id
export const editorIdAtom = atom('');
editorIdAtom.scope = _hexxScope;

export const editorWrapperAtom = atom<HTMLElement | null>(null);
editorWrapperAtom.scope = _hexxScope;

export const editorDefaultBlockAtom = atom<
  Pick<BlockType<any>, 'type' | 'data'>
>({
  type: 'paragraph',
  data: {
    text: '',
  },
});
editorDefaultBlockAtom.scope = _hexxScope;

// UI
type UIState = {
  isDragging: boolean;
  isSorting: boolean;
  sortingItemKey?: BlockAtom;
  [x: string]: any;
};

export const uiStateAtom = atom<UIState>({
  isDragging: false,
  isSorting: false,
});

uiStateAtom.scope = _hexxScope;

export type ActiveBlock = {
  id: string;
  editable?: HTMLDivElement;
  blockEl: HTMLDivElement;
};

// active block id
export const activeBlockAtom = atom<ActiveBlock | null>(null);

activeBlockAtom.scope = _hexxScope;

export const isEditorSelectAllAtom = atom<boolean>(false);
isEditorSelectAllAtom.scope = _hexxScope;

export const blockSelectAtom = atom(
  (get) => {
    return get(selectAtom);
  },
  (get, set, update: Set<string>) => {
    const selectedBlocksAtom = get(blocksAtom).filter((s) =>
      update.has(get(s).id),
    );
    set(selectAtom, new Set(selectedBlocksAtom));
  },
);

blockSelectAtom.scope = _hexxScope;

export const blockScopeAtom = atom<
  Record<string, BlockComponent<any, any>>
>({});
blockScopeAtom.scope = _hexxScope;

export const _blockIdListAtom = atom<string[]>([]);
_blockIdListAtom.scope = _hexxScope;

export const dropBlockAtom = atom<string | null>(null);
dropBlockAtom.scope = _hexxScope;

// history
type EditorHistory = Array<{
  label: string;
  undo: () => void;
  redo: () => void;
}>;
export const history: EditorHistory = [];

export const undoHistory: EditorHistory = [];

export const undo = () => {
  const last = history.pop();
  if (last) {
    last.undo();
    undoHistory.push(last);
  }
};

export const redo = () => {
  const last = undoHistory.pop();
  if (last) {
    last.redo();
  }
};

const MAX_HISTORY_COUNT = 100;

function updateHistory(data) {
  history.push(data);
  if (history.length > MAX_HISTORY_COUNT) {
    history.shift();
  }
}
