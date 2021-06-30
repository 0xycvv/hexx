import * as mdast from 'mdast';
import { MdastConfigs } from './parser/types';

export const presetMDASTConfig: MdastConfigs = {
  root: {
    type: 'paragraph',
    in: (content: mdast.Paragraph, toHTML) => ({
      text: toHTML(content).outerHTML,
    }),
  },
  paragraph: {
    type: 'paragraph',
    in: (content: mdast.Paragraph, toHTML) => ({
      text: toHTML(content).outerHTML,
    }),
  },
  blockquote: {
    type: 'quote',
    in: (content: mdast.Blockquote, toHTML) => ({
      text: toHTML(content).innerHTML,
    }),
  },
  list: {
    type: 'list',
    in: (content: mdast.List, toHTML) => ({
      style: content.ordered ? 'ordered' : 'unordered',
      items: content.children.map((child) => toHTML(child).innerHTML),
    }),
  },
  heading: {
    type: 'header',
    in: (mdast: mdast.Heading, toHTML) => ({
      text: toHTML(mdast).innerHTML,
      level: mdast.depth || 3,
    }),
  },
  thematicBreak: {
    type: 'delimiter',
  },
};
