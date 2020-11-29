import { atom } from 'jotai';
import { atomFamily } from 'jotai/utils.cjs';
import { BlockType } from '../components/editor';

// editor id
export const editorIdAtom = atom('');

type ActiveBlock = {
  id: string;
  editable?: HTMLDivElement;
  blockEl: HTMLDivElement;
};
// active block id
export const activeBlockIdAtom = atom<ActiveBlock>({});

export const isSelectAllAtom = atom<boolean>(false);

export const blockMapAtom = atom<Record<string, any>>({});

export const blockIdListAtom = atom<string[]>([]);
export const blocksIdMapAtom = atom<Record<string, any>>({});
export const blockAtomFamily = atomFamily((id) => (get) =>
  get(blocksIdMapAtom),
);
