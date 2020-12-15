import { ReactNode, NamedExoticComponent } from 'react';
import { StitchesCssProp } from '@hexx/theme';

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
  isEmpty?: (d: Data) => boolean;
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

export interface BlockProps<C = {}> {
  id: string;
  index: number;
  config?: C;
  children?: ReactNode;
  css?: StitchesCssProp;
}

interface BlockComponentBefore<BlockData = unknown, Config = unknown>
  extends NamedExoticComponent<BlockProps<Config>> {
  block?: BlockConfig<BlockData, Config>;
}

export interface BlockComponent<
  BlockConfig = unknown,
  Config = undefined
> {
  block: BlockConfig;
  (props: BlockProps<Config>): JSX.Element;
}

export function applyBlock<Data = unknown, Config = unknown>(
  Component: BlockComponentBefore<Data, Config>,
  block: Partial<BlockConfig<Data, Config>>,
) {
  if (Component.block) {
    Component.block = {
      ...Component.block,
      ...block,
    };
  } else {
    // @ts-ignore
    Component.block = block;
  }
  return Component as BlockComponent<
    BlockConfig<Data, Config>,
    Config
  >;
}
