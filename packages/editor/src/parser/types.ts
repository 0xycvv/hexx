import { BlockContent, Content } from 'mdast';
import { BlockType } from '../utils/blocks';

export type MdastConfig<K = Content['type']> = {
  type: K;
  in?: (content: any, toHTML: Function) => any;
};
export type MdastConfigs = {
  [key in string]: {
    blockType: string;
  } & MdastConfig;
};
