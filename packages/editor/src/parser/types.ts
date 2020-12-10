import { BlockContent } from 'mdast';
import { BlockType } from '../utils/blocks';

export type MdastConfig<K = BlockContent['type']> = {
  type: K;
  in: (content: BlockContent, toHTML: Function) => BlockType['data'];
};
export type AllMdastConfig = {
  [key in BlockContent['type']]: {
    blockType: string;
  } & MdastConfig;
};
