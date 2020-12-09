import { useMemo } from 'react';
import { usePlugin } from '../../plugins';
import { AllMdastConfig, MdastConfig } from '../types';

export function useBlockMdast() {
  const { editor } = usePlugin();
  const { blockMap } = editor;

  const allMdastConfig = useMemo(() => {
    let result = {} as AllMdastConfig;
    const arrayTagsConfig = Object.values(blockMap)
      .map((map) => {
        if (map.block?.mdast) {
          return {
            blockType: map.block.type,
            ...map.block.mdast,
          };
        }
        return null;
      })
      .filter(Boolean) as Array<{ blockType: string } & MdastConfig>;
    for (const config of arrayTagsConfig) {
      result[config.type] = {
        blockType: config.blockType,
        type: config.type,
        in: config.in,
      };
    }
    return result;
  }, []);

  return {
    allMdastConfig,
  };
}
