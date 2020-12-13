import * as atoms from '../constants/atom';
import { useAtomDevtools } from 'jotai/devtools.cjs';

if (process.env.NODE_ENV !== 'production') {
  Object.entries(atoms).forEach(([key, a]) => {
    if (typeof a === 'object' && 'scope' in a) {
      a.scope === atoms._hexxScope;
      a.debugLabel = key;
    }
  });
}

export function useEditorDevTool() {
  useAtomDevtools(atoms.uiStateAtom);
  useAtomDevtools(atoms._blockIdListAtom);
  useAtomDevtools(atoms._blocksIdMapAtom);
}

export function HexxDevTool() {
  return typeof window !== 'undefined' &&
    // @ts-ignore
    window.__REDUX_DEVTOOLS_EXTENSION__ ? (
    <ReduxDevtool />
  ) : null;
}

function ReduxDevtool() {
  useEditorDevTool();
  return null;
}
