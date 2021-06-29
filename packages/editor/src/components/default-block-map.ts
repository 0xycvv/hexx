import { Divider } from './block/divider';
import { HeaderBlock } from './block/header';
import { ListBlock } from './block/list';
import { QuoteBlock } from './block/quote';
import { TextBlock } from './block/text';

export const presetEditableScope = {
  paragraph: TextBlock,
  header: HeaderBlock,
  list: ListBlock,
  quote: QuoteBlock,
  delimiter: Divider,
};
