import * as mdast from 'mdast';
import { MdastConfigs } from './parser/types';

export const presetMDASTConfig: MdastConfigs = {
  paragraph: {
    type: 'paragraph',
    blockType: 'paragraph',
    in: (content: mdast.Paragraph, toHTML) => ({
      text: toHTML(content).outerHTML,
    }),
  },
  quote: {
    type: 'blockquote',
    blockType: 'quote',
    in: (content: mdast.Blockquote, toHTML) => ({
      text: toHTML(content).innerHTML,
    }),
  },
  list: {
    type: 'list',
    blockType: 'list',
    in: (content: mdast.List, toHTML) => ({
      style: content.ordered ? 'ordered' : 'unordered',
      items: content.children.map((child) => toHTML(child).innerHTML),
    }),
  },
  header: {
    type: 'heading',
    blockType: 'header',
    in: (mdast: mdast.Heading, toHTML) => ({
      text: toHTML(mdast).innerHTML,
      level: mdast.depth || 3,
    }),
  },
  delimiter: {
    blockType: 'delimiter',
    type: 'thematicBreak',
  },
};
