import { Parent, Content, BlockContent } from 'mdast';
import { processor } from './processor';
import toMdast from 'hast-util-to-mdast';
import { MdastConfigs } from '../types';

export const htmlToHast = (html: string) => processor.parse(html);
export const htmlToMdast = (html: string): Parent =>
  toMdast(htmlToHast(html));

export const isAvailableBlockContent = (
  content: Content,
  allMdastConfig: MdastConfigs,
): content is BlockContent => content.type in allMdastConfig;
