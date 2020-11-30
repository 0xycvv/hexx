import {
  Delimiter,
  EmbedLink,
  Header,
  List,
  Paragraph,
  Quote,
} from './block';

export type Block =
  | Delimiter
  | EmbedLink
  | Header
  | List
  | Paragraph
  | Quote;

export type BlockData<T extends object = {}> = {
  data: T;
  type: Block['type'] | string;
};
