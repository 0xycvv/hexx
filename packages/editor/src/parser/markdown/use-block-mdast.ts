import { useMemo } from 'react';
import { usePlugin } from '../../plugins';
import { getAllMdastConfig } from './parser';

export function useBlockMdast() {
  const { editor } = usePlugin();
  const { blockMap } = editor;

  const allMdastConfig = useMemo(
    () => getAllMdastConfig(blockMap),
    [],
  );

  return {
    allMdastConfig,
  };
}
