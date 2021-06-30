import { BlockData } from '@hexx/renderer/src/types';
import toDOM from 'hast-util-to-dom';
import { Parent } from 'mdast';
import fromMarkdown from 'mdast-util-from-markdown';
import toHast from 'mdast-util-to-hast';
import { v4 } from 'uuid';
import { BlockType } from '../../utils/blocks';
import { isAvailableBlockContent } from '../html/parser';
import { MdastConfigs } from '../types';

export function createHexxMarkdownParser(
  mdastConfigs: MdastConfigs,
  config?: MDToDataConfig,
) {
  return {
    toData: (markdown: string) =>
      markdownToData(mdastConfigs, markdown, config),
  };
}

interface MDToDataConfig {
  document?: Document;
  autoGenerateId?: boolean;
}

function markdownToData(
  allMdastConfig: MdastConfigs,
  markdown: string,
  config?: MDToDataConfig,
) {
  const mdast = fromMarkdown(markdown);
  return mdastToData(allMdastConfig, mdast, config);
}
export function mdastToData(
  allMdastConfig: MdastConfigs,
  mdast: Parent,
  config?: MDToDataConfig,
) {
  let results: BlockData[] = [];
  console.log(allMdastConfig, 'allMdastConfig');
  for (const children of mdast.children) {
    if (isAvailableBlockContent(children, allMdastConfig)) {
      const mdastConfig = allMdastConfig[children.type];
      if (mdastConfig) {
        let result: BlockData | BlockType = {
          type: mdastConfig.type,
          data:
            typeof mdastConfig.in === 'function'
              ? mdastConfig.in(children, (c) => {
                  const hast = toHast(c);
                  console.log(hast);
                  const dom = toDOM(hast, {
                    document: config?.document,
                  });
                  return dom;
                })
              : {},
        };
        if (config?.autoGenerateId) {
          // @ts-ignore
          result.id = v4();
        }
        results.push(result);
      }
    }
  }
  return results;
}
