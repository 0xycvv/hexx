import { atom } from 'jotai';
import { BlockType } from '../components/editor';

export const activeBlockIdAtom = atom<
  string,
  (blockId: string) => void
>(null);

export const blocksAtom = atom<BlockType[]>([]);

export const isSelectAllAtom = atom<boolean>(false);

export const lastRangeAtom = atom<Range, (r: Range) => Range>(null);
