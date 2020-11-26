import { atom } from 'jotai';
import { BlockType } from '../components/editor';

// editor id
export const editorIdAtom = atom('');

// active block id
export const activeBlockIdAtom = atom<
  string,
  (blockId: string) => void
>(null);

export const blocksAtom = atom<BlockType[]>([]);

export const isSelectAllAtom = atom<boolean>(false);

export const blockMapAtom = atom<Record<string, any>>({});
