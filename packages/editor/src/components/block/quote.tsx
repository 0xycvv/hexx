import * as React from 'react';
import { quoteStyle } from '@hexx/renderer';
import composeRefs from '../..//hooks/use-compose-ref';
import { useBlock } from '../../hooks/use-editor';
import { css } from '@hexx/theme';
import { lastCursor } from '../..//utils/find-blocks';
import { Editable } from '../editable';
import { quote as QuoteSvg } from '../icons';
import { BlockProps } from './block';

export function QuoteBlock({ block, config, index }: BlockProps) {
  const { update, register } = useBlock(block.id, index);
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    ref.current?.focus();
    lastCursor();
  }, []);

  return (
    <blockquote className={css(quoteStyle.wrapper)}>
      <Editable
        placeholder={config.placeholder}
        className={css(quoteStyle.text)}
        onChange={(evt) => {
          update({
            ...block.data,
            text: evt.target.value,
          });
        }}
        ref={composeRefs(ref, register)}
        html={block.data.text}
      />
    </blockquote>
  );
}

QuoteBlock.block = {
  type: 'quote',
  icon: {
    text: 'Quote',
    svg: QuoteSvg,
  },
  config: {
    placeholder: 'quote',
  },
  defaultValue: {
    text: '',
    alignment: 'left',
  },
  isEmpty: (d) => !d.text.trim(),
};
