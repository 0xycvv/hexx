import { atom, useAtom, WritableAtom } from 'jotai';
import { useMemo } from 'react';
import { _hexxScope } from '../constants/atom';

export function useUpdateAtom<Value, Update>(
  anAtom: WritableAtom<Value, Update>,
) {
  const writeOnlyAtom = useMemo(() => {
    return atom(null, (_get, set, update: Update) =>
      set(anAtom, update),
    );
  }, [anAtom]);
  writeOnlyAtom.scope = anAtom.scope;
  return useAtom(writeOnlyAtom)[1];
}

export function useNullableAtom<T = unknown, A = unknown>(
  at?: WritableAtom<T, A> | null,
) {
  let atomValue = at;
  if (!atomValue) {
    // @ts-ignore
    atomValue = atom(null);
    // @ts-ignore
    atomValue.scope = _hexxScope;
  }
  // @ts-ignore
  return useAtom(atomValue);
}
