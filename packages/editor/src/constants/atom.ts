import { atom } from 'jotai';
import { SetStateAction } from 'react';
import { BlockType } from '../components/editor';

export const _hexxScope = Symbol();

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
};

export const uiStateAtom = atom<UIState>({
  isDragging: false,
});

uiStateAtom.scope = _hexxScope;

type ActiveBlock = {
  id: string;
  editable?: HTMLDivElement;
  blockEl: HTMLDivElement;
};

// active block id
export const activeBlockIdAtom = atom<ActiveBlock | null>(null);

activeBlockIdAtom.scope = _hexxScope;

export const isEditorSelectAllAtom = atom<boolean>(false);
isEditorSelectAllAtom.scope = _hexxScope;

export const blockSelectAtom = atom<string[]>([]);

blockSelectAtom.scope = _hexxScope;

export const blockMapAtom = atom<Record<string, any>>({});
blockMapAtom.scope = _hexxScope;

export const _blockIdListAtom = atom<string[]>([]);
export const _blocksIdMapAtom = atom<Record<string, any>>({});
_blocksIdMapAtom.scope = _hexxScope;

export const hoverBlockAtom = atom<{
  id: string;
  el: HTMLElement;
} | null>(null);
hoverBlockAtom.scope = _hexxScope;

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

function debounce(func, wait, immediate): any {
  var timeout;
  return function() {
    var context = this,
      args = arguments;
    var later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

function updateHistory(data) {
  history.push(data);
  canUpdate = true;
}

const debounceUpdateHistory = debounce(updateHistory, 200, false);
let firstOldValue: Record<string, any> | null = null;
let canUpdate = false;
export const blocksIdMapAtom = atom(
  (get) => get(_blocksIdMapAtom),
  (get, set, arg: SetStateAction<Record<string, any>>) => {
    const oldValue = get(_blocksIdMapAtom);
    if (canUpdate) {
      firstOldValue = oldValue;
      canUpdate = false;
    }
    if (!oldValue) {
      return;
    }
    set(_blocksIdMapAtom, arg);
    const newValue = get(_blocksIdMapAtom);
    const old = { ...firstOldValue };
    if (!firstOldValue) {
      return;
    }
    debounceUpdateHistory({
      label: `${JSON.stringify(old)} -> ${JSON.stringify(newValue)}`,
      undo: () => {
        set(_blocksIdMapAtom, old);
      },
      redo: () => {
        set(_blocksIdMapAtom, newValue);
      },
    });
  },
);
blocksIdMapAtom.scope = _hexxScope;

export const blockIdListAtom = atom(
  (get) => get(_blockIdListAtom),
  (get, set, arg: SetStateAction<string[]>) => {
    const oldValue = get(_blockIdListAtom);
    set(_blockIdListAtom, arg);
    const newValue = get(_blockIdListAtom);
    history.push({
      label: `${JSON.stringify(oldValue)} -> ${JSON.stringify(
        newValue,
      )}`,
      undo: () => {
        set(_blockIdListAtom, oldValue);
      },
      redo: () => {
        set(_blockIdListAtom, newValue);
      },
    });
  },
);

blockIdListAtom.scope = _hexxScope;
