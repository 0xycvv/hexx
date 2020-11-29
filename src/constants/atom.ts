import { atom } from 'jotai';
import { atomFamily } from 'jotai/utils.cjs';

// editor id
export const editorIdAtom = atom('');

type ActiveBlock = {
  id: string;
  editable?: HTMLDivElement;
  blockEl: HTMLDivElement;
};
// active block id
// @ts-ignore
export const activeBlockIdAtom = atom<ActiveBlock>({});

export const isEditorSelectAllAtom = atom<boolean>(false);
export const blockSelectAtom = atom(-1);

export const blockMapAtom = atom<Record<string, any>>({});

export const blockIdListAtom = atom<string[]>([]);
export const blocksIdMapAtom = atom<Record<string, any>>({});
export const blockAtomFamily = atomFamily((id) => (get) =>
  get(blocksIdMapAtom),
);
