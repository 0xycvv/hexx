import * as React from 'react';
import composeRefs from '../..//hooks/use-compose-ref';
import { useBlock } from '../..//hooks/use-editor';
import { css } from '../..//stitches.config';
import { lastCursor } from '../..//utils/find-blocks';
import { Editable } from '../editable';
import { quote as QuoteSvg } from '../icons';
import { BlockProps } from './block';

const styles = {
  wrapper: {
    paddingLeft: '24px',
    paddingRight: '24px',
    paddingTop: 3,
    paddingBottom: 3,
  },
  text: {
    borderTop: 'none',
    borderRight: 'none',
    borderBottom: 'none',
    borderImage: 'initial',
    borderLeft: '2px solid rgb(36, 37, 38)',
    boxShadow: 'none',
    borderRadius: 0,
    marginBottom: 10,
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 16,
    paddingRight: 12,
    fontSize: '1rem',
    lineHeight: '20px',
    fontStyle: 'italic',
    color: 'rgb(36, 37, 38)',
    minHeight: 'unset !important',
  },
};

export function QuoteBlock({ block, config, index }: BlockProps) {
  const { update, register } = useBlock(block.id, index);
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    ref.current?.focus();
    lastCursor();
  }, []);

  return (
    <blockquote className={css(styles.wrapper)}>
      <Editable
        placeholder={config.placeholder}
        className={css(styles.text)}
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
