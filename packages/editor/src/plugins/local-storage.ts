import { atom, useAtom } from 'jotai';
import { splitAtom } from 'jotai/utils';
import { forwardRef, useImperativeHandle } from 'react';
import {
  blocksDataAtom,
  createAtom,
  _blockIdListAtom,
  _blocksAtom,
  _hexxScope,
} from '../constants/atom';

const serializeAtom = atom<
  null,
  | { type: 'serialize'; callback: (value: string) => void }
  | { type: 'deserialize'; value: string }
>(null, (get, set, action) => {
  if (action.type === 'serialize') {
    const blocks = get(blocksDataAtom);
    action.callback(JSON.stringify(blocks));
  } else if (action.type === 'deserialize') {
    const obj = JSON.parse(action.value);
    if (obj) {
      // needs error handling and type checking
      const dataAtom = createAtom(obj || []);
      const data = splitAtom(dataAtom);
      // @ts-ignore
      set(_blocksAtom, data);
    }
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
