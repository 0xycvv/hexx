import { atom } from 'jotai';
import { SetStateAction } from 'react';

export const _hexxScope = Symbol();

// editor id
export const editorIdAtom = atom('');
editorIdAtom.scope = _hexxScope;

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
export const blockSelectAtom = atom(-1);

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
export const history: Array<{
  label: string;
  undo: () => void;
}> = [];

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
    if (!firstOldValue) return;
    debounceUpdateHistory({
      label: `${JSON.stringify(old)} -> ${JSON.stringify(newValue)}`,
      diff: { old, newValue },
      undo: () => {
        if (!old) return;
        console.log(old);
        set(_blocksIdMapAtom, old);
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
    });
  },
);

blockIdListAtom.scope = _hexxScope;
