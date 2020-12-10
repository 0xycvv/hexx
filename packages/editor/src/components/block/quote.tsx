import * as React from 'react';
import * as mdast from 'mdast';
import { quoteStyle, Quote } from '@hexx/renderer';
import composeRefs from '../..//hooks/use-compose-ref';
import { useBlock } from '../../hooks/use-editor';
import { css, applyBlock, BlockProps } from '@hexx/theme';
import { lastCursor } from '../..//utils/find-blocks';
import { Editable } from '../editable';
import { quote as QuoteSvg } from '../icons';

function _QuoteBlock({
  config,
  index,
  id,
}: BlockProps<{ placeholder: string }>) {
  const { update, register, block } = useBlock(id, index);
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    ref.current?.focus();
    lastCursor();
  }, []);

  return (
    <blockquote className={css(quoteStyle.wrapper)}>
      <Editable
        placeholder={config?.placeholder}
        className={css(quoteStyle.text)}
        onChange={(evt) => {
          update({
            ...block,
            data: {
              ...block.data,
              text: evt.target.value,
            },
          });
        }}
        ref={composeRefs(ref, register)}
        html={block.data.text}
      />
    </blockquote>
  );
}

// @ts-ignore
export const QuoteBlock = applyBlock(React.memo(_QuoteBlock), {
  type: 'quote',
  icon: {
    text: 'Quote',
    svg: QuoteSvg,
  },
  config: {
    placeholder: 'quote',
  },
  mdast: {
    type: 'blockquote',
    in: (content: mdast.Blockquote, toHTML) => ({
      text: toHTML(content).innerHTML,
    }),
  },
  defaultValue: {
    text: '',
    alignment: 'left',
  },
  isEmpty: (d) => !d.text?.trim(),
});
