import { useEventListener } from '../hooks';
import { isContentEditable } from '../utils/is';
import { usePlugin } from './plugin';
import { createRangeLink } from '../utils/find-blocks';
import { useRef } from 'react';
import type LinkifyIt from 'linkify-it';

function findLastText(node: Node | ChildNode | null): Text | null {
  if (!node) return null;
  if (node instanceof Text) {
    return node;
  }
  return findLastText(node.lastChild);
}

/**
 * install peer dependency `linkify-it`
 *
 * @example
 * ```tsx
 * import Linkify from 'linkify-it';
 * import tlds from 'tlds';
 * const linkify = Linkify();
 * linkify.add(tlds)
 * <LinkifyItPlugin linkifyIt={linkify} />
 * ```
 */
export function LinkifyItPlugin(props: {
  linkifyIt: LinkifyIt.LinkifyIt;
}) {
  const linkifyRef = useRef(props.linkifyIt);
  const { wrapperRef } = usePlugin();

  useEventListener(
    'keyup',
    (e) => {
      if (e.key === ' ' && isContentEditable(e.target)) {
        const text = findLastText(e.target.lastChild);
        if (text?.textContent) {
          const match = linkifyRef.current.match(text.textContent);
          if (match) {
            const lastMatch = match[match.length - 1];

            const range = document.createRange();
            range.setStart(text, lastMatch.index);
            range.setEnd(text, lastMatch.lastIndex);
            createRangeLink(range, lastMatch.url);
          }
        }
      }
    },
    wrapperRef,
  );

  return null;
}
