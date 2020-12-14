import { atom, useAtom } from 'jotai';
import { forwardRef, useImperativeHandle } from 'react';
import {
  _blockIdListAtom,
  _blocksIdMapAtom,
  _hexxScope,
} from '../constants/atom';

const serializeAtom = atom<
  null,
  | { type: 'serialize'; callback: (value: string) => void }
  | { type: 'deserialize'; value: string }
>(null, (get, set, action) => {
  if (action.type === 'serialize') {
    const ids = get(_blockIdListAtom);
    const map = get(_blocksIdMapAtom);
    const obj = {
      ids,
      map,
    };
    action.callback(JSON.stringify(obj));
  } else if (action.type === 'deserialize') {
    const obj = JSON.parse(action.value);
    // needs error handling and type checking
    set(_blockIdListAtom, obj.ids);
    set(_blocksIdMapAtom, obj.map);
  }
});
serializeAtom.scope = _hexxScope;

interface LocalStoragePluginHandler {
  save: VoidFunction;
  load: VoidFunction;
}

export const LocalStoragePlugin = forwardRef<
  LocalStoragePluginHandler,
  { key?: string }
>((props, ref) => {
  const key = props.key || '@hexx:editor.v0';
  const [, dispatch] = useAtom(serializeAtom);
  const save = () => {
    dispatch({
      type: 'serialize',
      callback: (value) => {
        localStorage.setItem(key, value);
      },
    });
  };
  const load = () => {
    const value = localStorage.getItem(key);
    if (value) {
      dispatch({ type: 'deserialize', value });
    }
  };

  useImperativeHandle(ref, () => ({
    save,
    load,
  }));

  return null;
});
