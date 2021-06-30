import { Content } from 'mdast';

export type MdastConfig<K = Content['type'] | 'root'> = {
  in?: (content: any, toHTML: Function) => any;
};
export type MdastConfigs = {
  [key in Content['type'] | 'root']?: {
    type: string;
  } & MdastConfig;
};
