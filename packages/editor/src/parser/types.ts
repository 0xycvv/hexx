import { Content } from 'mdast';
import { BlockType } from '../utils/blocks';

export type MdastConfig<K = Content['type']> = {
  type: K;
  in: (content: Content, toHTML: Function) => BlockType['data'];
};
export type AllMdastConfig = {
  [key in Content['type']]: {
    blockType: string;
  } & MdastConfig;
};
