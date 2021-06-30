import { Parent, Content, BlockContent } from 'mdast';
import { processor } from './processor';
import toMdast from 'hast-util-to-mdast';
import all from 'hast-util-to-mdast/lib/all';
import { MdastConfigs } from '../types';

export const htmlToHast = (html: string) => processor.parse(html);
export const htmlToMdast = (html: string): Parent => {
  return toMdast(htmlToHast(html), {
    handlers: {
      u: (h, node) => {
        return h(node, 'underline', all(h, node));
      },
    },
  });
};

export const isAvailableBlockContent = (
  content: Content,
  allMdastConfig: MdastConfigs,
): content is BlockContent => content.type in allMdastConfig;
