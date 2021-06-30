import toDom from 'hast-util-to-dom';
import toHast from 'mdast-util-to-hast';
import { useEditor, useEventListener } from '../hooks';
import { isContentEditableDiv } from '../utils/is';
import { usePlugin } from './plugin';
import fromMarkdown from 'mdast-util-from-markdown';
import {
  Blockquote,
  Code,
  Heading,
  List,
  Parent,
  ThematicBreak,
  Content,
} from 'mdast';
import { v4 } from 'uuid';
import { MdastConfigs } from '../parser/types';

type WholeBlock = Heading | ThematicBreak | Blockquote | List | Code;

const wholeBlockList: WholeBlock['type'][] = [
  'blockquote',
  'code',
  'heading',
  'list',
  'thematicBreak',
];

const isWholeBlock = (content: Content): content is WholeBlock =>
  wholeBlockList.includes(content.type as any);

const bold = {
  match: /[\*\_]{2}([^\*\_]+)[\*\_]{2}/g,
  replace: '<b>$1</b>',
  offset: -5,
};
const italic = {
  match: /[\*\_]{1}([^\*\_]+)[\*\_]{1}/g,
  notStartWith: '**',
  replace: '<i>$1</i>',
  offset: -3,
};

const code = {
  match: /[\`]{1}([^\*\_]+)[\`]{1}/g,
  notStartWith: '```',
  replace: '<code>$1</code>',
  offset: -3,
};

const replaceInlineMarkdown = (
  str: string,
  match: RegExp,
  replace: string,
) => str.replace(match, replace);

type MarkdownShortcutPluginProps = {
  mdastConfigs: MdastConfigs;
};

export function Unstable_MarkdownShortcutPlugin({
  mdastConfigs,
}: MarkdownShortcutPluginProps) {
  const { wrapperRef } = usePlugin();
  const { replaceBlockById } = useEditor();

  useEventListener(
    'keyup',
    (e) => {
      const currentBlockId =
        e.target instanceof HTMLElement &&
        e.target.closest('[data-block-id]') &&
        // @ts-ignore
        e.target.closest('[data-block-id]').dataset.blockId;

      if (!currentBlockId) return;
      if (isContentEditableDiv(e.target)) {
        if (e.key === ' ') {
          const mdast = fromMarkdown(e.target.innerHTML) as Parent;
          const content = mdast.children[0];
          if (content && isWholeBlock(content)) {
            const firstMdast = mdast.children[0];
            const mdastConfig = mdastConfigs[firstMdast.type];
            if (mdastConfig) {
              replaceBlockById({
                id: currentBlockId,
                block: {
                  type: mdastConfig.type,
                  id: v4(),
                  data:
                    typeof mdastConfig.in === 'function'
                      ? mdastConfig.in(firstMdast, (c) =>
                          toDom(toHast(c)),
                        )
                      : {},
                },
              });
              return;
            }
          }
        }
        // inline markdown
        if (e.key === '*' || e.key === '_' || e.key === '`') {
          const selection = window.getSelection();
          let html = e.target.innerHTML;

          if (selection) {
            for (const inlineMD of [bold, italic, code]) {
              const matched = html.match(inlineMD.match);
              if (
                matched &&
                ('notStartWith' in inlineMD
                  ? !html.includes(
                      // @ts-ignore
                      inlineMD.notStartWith,
                    )
                  : true)
              ) {
                const restore = saveCaretPosition(
                  e.target,
                  inlineMD.offset,
                );
                e.target.innerHTML = replaceInlineMarkdown(
                  html,
                  inlineMD.match,
                  inlineMD.replace,
                );
                const range = restore();
                if (range) {
                  if (
                    range.commonAncestorContainer
                      .parentElement instanceof HTMLElement
                  ) {
                    const cursor = document.createElement('span');
                    cursor.insertAdjacentText('beforeend', ' ');
                    range.commonAncestorContainer.parentElement.insertAdjacentElement(
                      'afterend',
                      cursor,
                    );
                    const selection = getSelection();
                    range.setStart(cursor, 1);
                    selection?.removeAllRanges();
                    selection?.addRange(range);
                  }
                }
              }
            }
          }
        }
      }
    },
    wrapperRef,
  );

  return null;
}
function saveCaretPosition(
  context: Node,
  offset = 0,
): () => Range | undefined {
  var selection = window.getSelection();
  if (!selection) {
    return () => {
      return undefined;
    };
  }
  var range = selection.getRangeAt(0);
  range.setStart(context, 0);
  var len = range.toString().length + offset;

  return function restore() {
    if (!selection) return;
    var pos = getTextNodeAtPosition(context, len);
    selection.removeAllRanges();
    var range = new Range();
    range.setStart(pos.node, pos.position);
    selection.addRange(range);
    return range;
  };
}

function getTextNodeAtPosition(root, index) {
  let lastNode: string | null = null;

  let treeWalker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT,
    function (elem) {
      if (index >= elem.textContent.length) {
        index -= elem.textContent.length;
        lastNode = elem;
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  );
  let c = treeWalker.nextNode();
  return {
    node: c ? c : lastNode ? lastNode : root,
    // @ts-ignore
    position: c ? index : lastNode ? lastNode.length : 0,
  };
}
