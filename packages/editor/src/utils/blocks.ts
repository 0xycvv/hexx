import { ReactNode, NamedExoticComponent } from 'react';
import { PrimitiveAtom } from 'jotai';
import { StitchesCssProp } from '@hexx/theme';
import { BlockContent, PhrasingContent } from 'mdast';

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
  mdast?: {
    type:
      | BlockContent['type']
      | `${BlockContent['type']}.${PhrasingContent['type']}`;
    in?: (
      content: BlockContent | PhrasingContent | any,
      toHTML: (child: BlockContent['children']) => HTMLElement,
    ) => Data;
  };
  tune?: Array<{
    icon: {
      text: string;
      svg: any;
      isActive?: (data: Data) => boolean;
    };
    updater: (data: Data) => Data;
  }>;
  css?: StitchesCssProp;
  [x: string]: any;
}

export interface BlockProps<C = {}> {
  id: string;
  index: number;
  config?: C;
  children?: ReactNode;
  blockAtom: PrimitiveAtom<BlockType<any>>;
  css?: StitchesCssProp;
}

interface BlockComponentBefore<BlockData = unknown, Config = unknown>
  extends NamedExoticComponent<BlockProps<Config>> {
  block?: BlockConfig<BlockData, Config>;
}

export interface BlockComponent<
  BlockConfig = unknown,
  Config = undefined,
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

export function isBlockEmpty(
  block?: BlockComponent<any, any>,
  data?: any,
) {
  return typeof block?.block.isEmpty === 'function'
    ? block?.block.isEmpty(data)
    : false;
}
