import { ReactNode } from 'react';
import { StitchesCssProp } from './stitches.config';

export type BlockType<T = any> = {
  id: string;
  type: string;
  data: T;
};

export interface BlockProps<T = any, C = any> {
  block: BlockType<T>;
  index: number;
  config?: C;
  children?: ReactNode;
  css?: StitchesCssProp;
}

interface BlockComponentBefore<
  BlockData = unknown,
  Config = undefined,
  BlockConfig = unknown
> {
  block?: BlockConfig;
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

export function applyBlock<
  Data = unknown,
  Config = undefined,
  B = {
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
>(Component: BlockComponentBefore<Data, Config, B>, block: B) {
  if (Component.block) {
    Component.block = {
      ...Component.block,
      ...block,
    };
  } else {
    Component.block = block;
  }
  return Component as BlockComponent<Data, Config, B>;
}
