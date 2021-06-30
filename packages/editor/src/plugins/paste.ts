import { useAtom } from 'jotai';
import { Parent } from 'mdast';
import fromMarkdown from 'mdast-util-from-markdown';
import { v4 } from 'uuid';
import { CLIPBOARD_DATA_FORMAT } from '../constants';
import { blocksIdsAtom } from '../constants/atom';
import { useEventListener } from '../hooks';
import { htmlToMdast } from '../parser/html/parser';
import { mdastToData } from '../parser/markdown/parser';
import { MdastConfigs } from '../parser/types';
import { usePlugin } from './plugin';

type PastHtmlPluginProps = {
  mdastConfigs: MdastConfigs;
};

export function PastHtmlPlugin({
  mdastConfigs,
}: PastHtmlPluginProps) {
  const { wrapperRef, activeBlock, editor } = usePlugin();
  const { batchInsertBlocks } = editor;
  const [idList] = useAtom(blocksIdsAtom);

  useEventListener(
    'paste',
    (e) => {
      const html = e.clipboardData?.getData('text/html');
      const text = e.clipboardData?.getData('text/plain');
      const hexx = e.clipboardData?.getData(CLIPBOARD_DATA_FORMAT);
      const index = idList.findIndex((id) => id === activeBlock?.id);
      console.log(html, text);
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
        const mdastParent = htmlToMdast(html);
        try {
          const results = mdastToData(mdastConfigs, mdastParent);
          if (results.length > 0) {
            batchInsertBlocks({ blocks: results, index });
          }
        } catch (error) {
          console.error('[hexx] error when pasting html', error);
        }
        e.preventDefault();
      } else if (text) {
        const mdast = fromMarkdown(text) as Parent;
        if (
          mdast.children.length == 1 &&
          mdast.children[0].type === 'paragraph'
        ) {
          return;
        }
        try {
          const results = mdastToData(mdastConfigs, mdast);
          if (results.length > 0) {
            batchInsertBlocks({ blocks: results, index });
          }
        } catch (error) {
          console.error('[hexx] error when pasting markdown', error);
        }
        e.preventDefault();
      }
    },
    wrapperRef,
  );
  return null;
}
