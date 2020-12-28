import { Parent } from 'mdast';
import toHast from 'mdast-util-to-hast';
import toDOM from 'hast-util-to-dom';
import fromMarkdown from 'mdast-util-from-markdown';
import { BlockComponent, BlockType } from '../../utils/blocks';
import { isAvailableBlockContent } from '../html/parser';
import { AllMdastConfig, MdastConfig } from '../types';
import { BlockData } from '@hexx/renderer/src/types';
import { v4 } from 'uuid';

export function createHexxMarkdownParser(
  blockMap: Record<string, BlockComponent<any, any>>,
  config?: MDToDataConfig,
) {
  const allMdastConfig = getAllMdastConfig(blockMap);
  return {
    toData: (markdown: string) =>
      markdownToData(allMdastConfig, markdown, config),
    getAllMdastConfig,
  };
}

interface MDToDataConfig {
  document?: Document;
  autoGenerateId?: boolean;
}

function markdownToData(
  allMdastConfig: AllMdastConfig,
  markdown: string,
  config?: MDToDataConfig,
) {
  const mdast = fromMarkdown(markdown);
  return mdastToData(allMdastConfig, mdast, config);
}
export function mdastToData(
  allMdastConfig: AllMdastConfig,
  mdast: Parent,
  config?: MDToDataConfig,
) {
  let results: BlockData[] = [];
  for (const children of mdast.children) {
    if (isAvailableBlockContent(children, allMdastConfig)) {
      const mdastConfig = allMdastConfig[children.type];
      let result: BlockData | BlockType = {
        type: mdastConfig.blockType,
        data:
          typeof mdastConfig.in === 'function'
            ? mdastConfig.in(children, (c) => {
                const hast = toHast(c);
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
  return results;
}

export function getAllMdastConfig(
  blockMap: Record<string, BlockComponent<any, any>>,
) {
  let result = {} as AllMdastConfig;
  const arrayTagsConfig = Object.values(blockMap)
    .map((map) => {
      if (map.block?.mdast) {
        return {
          blockType: map.block.type,
          ...map.block.mdast,
        };
      }
      return null;
    })
    .filter(Boolean) as Array<{ blockType: string } & MdastConfig>;
  for (const config of arrayTagsConfig) {
    result[config.type] = {
      blockType: config.blockType,
      type: config.type,
      in: config.in,
    };
  }
  return result;
}
