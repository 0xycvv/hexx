import toDOM from 'hast-util-to-dom';
import { Parent } from 'mdast';
import toHast from 'mdast-util-to-hast';
import { useEventListener } from '../hooks';
import {
  htmlToMdast,
  isAvailableBlockContent,
} from '../parser/html/parser';
import { useBlockMdast } from '../parser/markdown/use-block-mdast';
import { usePlugin } from './plugin';
import fromMarkdown from 'mdast-util-from-markdown';
import { AllMdastConfig } from '../parser/types';
import { CLIPBOARD_DATA_FORMAT } from '../constants';
import { v4 } from 'uuid';

export function PastHtmlPlugin() {
  const {
    wrapperRef,
    activeBlock,
    editor,
    ids: [idList],
  } = usePlugin();
  const { batchInsertBlocks } = editor;
  const { allMdastConfig } = useBlockMdast();

  useEventListener(
    'paste',
    (e) => {
      const html = e.clipboardData?.getData('text/html');
      const text = e.clipboardData?.getData('text/plain');
      const hexx = e.clipboardData?.getData(CLIPBOARD_DATA_FORMAT);
      const index = idList.findIndex((id) => id === activeBlock?.id);
      console.log(hexx);
      if (hexx) {
        batchInsertBlocks({
          index,
          blocks: JSON.parse(hexx).map((block) => ({
            ...block,
            id: v4(),
          })),
        });
      e.preventDefault();
      } else if (html) {
        console.log("?????");
        const mdastParent = htmlToMdast(html);
        try {
          pushAllResultToBlock(
            e,
            mdastParent,
            allMdastConfig,
            batchInsertBlocks,
            index,
          );
        } catch (error) {
          console.error('[hexx] error when pasting html', error);
        }
      } else if (text) {
        const mdast = fromMarkdown(text) as Parent;
        if (
          mdast.children.length == 1 &&
          mdast.children[0].type === 'paragraph'
        ) {
          return;
        }
        try {
          pushAllResultToBlock(
            e,
            mdast,
            allMdastConfig,
            batchInsertBlocks,
            index,
          );
        } catch (error) {
          console.error('[hexx] error when pasting markdown', error);
        }
      }
    },
    wrapperRef,
  );
  return null;
}

function pushAllResultToBlock(
  e: ClipboardEvent,
  parent: Parent,
  allMdastConfig: AllMdastConfig,
  batch: any,
  index?: number,
) {
  let results: any[] = [];
  for (const children of parent.children) {
    if (isAvailableBlockContent(children, allMdastConfig)) {
      const mdastConfig = allMdastConfig[children.type];
      results.push({
        type: mdastConfig.blockType,
        data:
          typeof mdastConfig.in === 'function'
            ? mdastConfig.in(children, (c) => toDOM(toHast(c)))
            : {},
      });
    }
  }
  if (results.length > 0) {
    batch({ blocks: results, index });
    e.preventDefault();
  }
}
