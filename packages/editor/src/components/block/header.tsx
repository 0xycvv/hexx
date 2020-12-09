import * as mdast from 'mdast';
import { headerStyle, Header } from '@hexx/renderer';
import { styled } from '@hexx/theme';
import * as React from 'react';
import composeRefs from '../../hooks/use-compose-ref';
import { useBlock } from '../../hooks/use-editor';
import { lastCursor } from '../../utils/find-blocks';
import { Editable } from '../editable';
import { header as HeaderSvg } from '../icons';
import { BlockProps } from './block';

const Heading = styled(Editable, headerStyle);

export function HeaderBlock({
  block,
  index,
  config,
}: BlockProps<Header['data'], { placeholder: string }>) {
  const { register, update } = useBlock(block.id, index);

  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    ref.current?.focus();
    lastCursor();
  }, []);

  return (
    <Heading
      h={String(block.data.level) || '3'}
      placeholder={config?.placeholder}
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
  mdast: {
    type: 'heading',
    in: (mdast: mdast.Heading, toHTML) => ({
      text: toHTML(mdast).innerHTML,
      level: mdast.depth || 3,
    }),
  },
  icon: {
    text: 'Header',
    svg: HeaderSvg,
  },
  defaultValue: {
    text: '',
    level: 3,
  },
  isEmpty: (d) => !d.text.trim(),
};
