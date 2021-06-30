import { Quote, quoteStyle } from '@hexx/renderer';
import { css } from '@hexx/theme';
import * as mdast from 'mdast';
import * as React from 'react';
import { useBlock } from '../../hooks/use-editor';
import { applyBlock, BlockProps } from '../../utils/blocks';
import { Editable } from '../editable';

function _QuoteBlock({
  config,
  index,
  blockAtom,
}: BlockProps<{ placeholder: string }>) {
  const { update, block } = useBlock(blockAtom);

  return (
    <blockquote className={css(quoteStyle.wrapper)()}>
      <Editable
        placeholder={config?.placeholder}
        className={css(quoteStyle.text)()}
        onChange={(evt) => {
          update({
            ...block,
            data: {
              ...block.data,
              text: evt.target.value,
            },
          });
        }}
        html={block.data.text}
      />
    </blockquote>
  );
}
export const QuoteBlock = applyBlock<
  Quote['data'],
  { placeholder: string }
>(_QuoteBlock, {
  type: 'quote',
  config: {
    placeholder: 'quote',
  },
  defaultValue: {
    text: '',
    alignment: 'left',
  },
  isEmpty: (d) => !d.text?.trim(),
});
