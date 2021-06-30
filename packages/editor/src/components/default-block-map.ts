import { Divider } from './block/divider';
import { HeaderBlock } from './block/header';
import { ListBlock } from './block/list';
import { QuoteBlock } from './block/quote';
import { ParagraphBlock } from './block/paragraph';

export const presetEditableScope = {
  paragraph: ParagraphBlock,
  header: HeaderBlock,
  list: ListBlock,
  quote: QuoteBlock,
  delimiter: Divider,
};
