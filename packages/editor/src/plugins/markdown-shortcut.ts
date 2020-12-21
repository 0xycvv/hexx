import toDOM from 'hast-util-to-dom';
import { Parent } from 'mdast';
import toHast from 'mdast-util-to-hast';
import { v4 } from 'uuid';
import { useEditor, useEventListener } from '../hooks';
import { useBlockMdast } from '../parser/markdown/use-block-mdast';
import { isContentEditable } from '../utils/is';
import { usePlugin } from './plugin';
import fromMarkdown from 'mdast-util-from-markdown';
export function Unstable_MarkdownShortcutPlugin() {
  const { wrapperRef, activeBlock } = usePlugin();
  const { allMdastConfig } = useBlockMdast();
  const { replaceBlockById, blockMap, getBlock } = useEditor();
  const currentBlockId = activeBlock?.id;

  useEventListener(
    'keyup',
    (e) => {
      if (!currentBlockId) return;
      getBlock({ id: currentBlockId }).then((block) => {
        if (e.key === ' ' && isContentEditable(e.target)) {
          const mdast = fromMarkdown(e.target.innerHTML) as Parent;
          const currentBlockMdast =
            blockMap[block.type]?.block?.mdast;
          if (
            mdast.children[0] &&
            currentBlockMdast &&
            mdast.children[0].type !== currentBlockMdast.type
          ) {
            const firstMdast = mdast.children[0];
            const mdastConfig = allMdastConfig[firstMdast.type];
            if (mdastConfig) {
              replaceBlockById({
                id: currentBlockId,
                block: {
                  type: mdastConfig.blockType,
                  id: v4(),
                  data:
                    typeof mdastConfig.in === 'function'
                      ? mdastConfig.in(firstMdast, (c) =>
                          toDOM(toHast(c)),
                        )
                      : {},
                },
              });
            }
          }
        }
      });
    },
    wrapperRef,
  );

  return null;
}
