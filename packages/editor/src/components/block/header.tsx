import * as React from 'react';
import { useBlock, useEditor } from '../../hooks/use-editor';
import { lastCursor } from '../../utils/find-blocks';
import { Editable } from '../editable';
import { BlockProps } from './block';
import { header as HeaderSvg } from '../icons';
import { css } from '../../stitches.config';
import composeRefs from '../../hooks/use-compose-ref';

const styles = css({
  padding: '3px 2px',
  '&.e-h1': {
    fontSize: '2.5rem',
    fontWeight: 700,
  },
  '&.e-h2': {
    fontSize: '2rem',
    fontWeight: 700,
  },
  '&.e-h3': {
    fontSize: '1.5rem',
    fontWeight: 700,
  },
});

export function HeaderBlock({ block, index, config }: BlockProps) {
  const { register, update } = useBlock(block.id, index);

  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    ref.current?.focus();
    lastCursor();
  }, []);

  return (
    <Editable
      placeholder={config.placeholder}
      className={`e-h${block.data.level} ${styles}`}
      ref={composeRefs(ref, register)}
      onChange={(evt) =>
        update({
          ...block.data,
          text: evt.target.value,
        })
      }
      html={block.data.text}
    />
  );
}

HeaderBlock.block = {
  type: 'header',
  config: {
    placeholder: 'Heading',
  },
  icon: {
    text: 'Header',
    svg: HeaderSvg,
  },
  defaultValue: {
    text: '',
    level: 2,
  },
  isEmpty: (d) => !d.text.trim(),
};
