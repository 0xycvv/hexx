import { useAtom } from 'jotai';
import { useMemo } from 'react';
import { blockMapAtom } from '../../constants/atom';
import { getAllMdastConfig } from './parser';

export function useBlockMdast() {
  const [blockMap] = useAtom(blockMapAtom);

  const allMdastConfig = useMemo(
    () => getAllMdastConfig(blockMap),
    [],
  );

  return {
    allMdastConfig,
  };
}
