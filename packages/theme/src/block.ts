import { ReactNode } from 'react';
import { StitchesCssProp } from './stitches.config';

export type BlockType<T = any> = {
  id: string;
  type: string;
  data: T;
};

interface BlockConfig<Data, Config> {
  type: string;
  config?: Config;
  icon?: {
    text: string;
    svg: any;
  };
  defaultValue: Partial<Data>;
  isEmpty: (d: Data) => boolean;
  tune?: Array<{
    icon: {
      text: string;
      svg: any;
      isActive?: (data: Data) => boolean;
    };
    updater: (data: Data) => Data;
  }>;
  [x: string]: any;
}

export interface BlockProps<T = any, C = any> {
  block: BlockType<T>;
  index: number;
  config?: C;
  children?: ReactNode;
  css?: StitchesCssProp;
}

interface BlockComponentBefore<
  BlockData = unknown,
  Config = undefined
> {
  block?: BlockConfig<BlockData, Config>;
  (props: BlockProps<BlockData, Config>): JSX.Element;
}
export interface BlockComponent<
  BlockData = unknown,
  Config = undefined,
  BlockConfig = unknown
> {
  block: BlockConfig;
  (props: BlockProps<BlockData, Config>): JSX.Element;
}

export function applyBlock<Data = unknown, Config = undefined>(
  Component: BlockComponentBefore<Data, Config>,
  block: BlockConfig<Data, Config>,
) {
  if (Component.block) {
    Component.block = {
      ...Component.block,
      ...block,
    };
  } else {
    Component.block = block;
  }
  return Component as BlockComponent<Data, Config>;
}
