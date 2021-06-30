import { Block } from './types';
import * as DefaultBlocks from './block';

export const PresetScope: {
  [key in Block['type'] | string]: any;
} = {
  paragraph: DefaultBlocks.ParagraphRenderer,
  delimiter: DefaultBlocks.DelimiterRenderer,
  header: DefaultBlocks.HeaderRenderer,
  list: DefaultBlocks.ListRenderer,
  quote: DefaultBlocks.QuoteRenderer,
};
