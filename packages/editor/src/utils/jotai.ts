import { useCallback, useMemo } from 'react';
import { atom, useAtom, WritableAtom } from 'jotai';
import { Getter, Setter } from 'jotai/core/types';
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

export function useAtomCallback<Result>(
  callback: (get: Getter, set: Setter) => Result,
): () => Promise<Result>;

export function useAtomCallback<Result, Arg>(
  callback: (get: Getter, set: Setter, arg: Arg) => Result,
): (arg: Arg) => Promise<Result>;

export function useAtomCallback<Result, Arg>(
  callback: (get: Getter, set: Setter, arg: Arg) => Result,
) {
  const anAtom = useMemo(
    () =>
      atom(
        null,
        (
          get,
          set,
          [arg, resolve, reject]: [
            Arg,
            (result: Result) => void,
            (reason: any) => void,
          ],
        ) => {
          try {
            resolve(callback(get, set, arg));
          } catch (e) {
            reject(e);
          }
        },
      ),
    [callback],
  );

  anAtom.scope = _hexxScope;
  const [, invoke] = useAtom(anAtom);
  return useCallback(
    (arg: Arg) =>
      new Promise<Result>((resolve, reject) => {
        invoke([arg, resolve, reject]);
      }),
    [invoke],
  );
}
