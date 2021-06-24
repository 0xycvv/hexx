import { Header, headerStyle } from '@hexx/renderer';
import { styled } from '@hexx/theme';
import * as mdast from 'mdast';
import * as React from 'react';
import composeRefs from '../../hooks/use-compose-ref';
import { useBlock } from '../../hooks/use-editor';
import { applyBlock, BlockProps } from '../../utils/blocks';
import { lastCursor } from '../../utils/find-blocks';
import { Editable } from '../editable';
import { h1, h2, h3, header as HeaderSvg } from '../icons';

const Heading = styled(Editable, headerStyle);

function _HeaderBlock({
  id,
  index,
  config,
  css,
  blockAtom,
}: BlockProps<{ placeholder: string }>) {
  const { register, update, block } = useBlock(blockAtom, index);

  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    ref.current?.focus();
    lastCursor();
  }, []);

  return (
    <Heading
      h={(String(block.data.level) as any) || '3'}
      placeholder={config?.placeholder}
      ref={composeRefs(ref, register)}
      onChange={(evt) =>
        update({
          ...block,
          data: {
            ...block.data,
            text: evt.target.value,
          },
        })
      }
      html={block.data.text}
      css={css}
    />
  );
}

export const HeaderBlock = applyBlock<
  Header['data'],
  { placeholder: string }
>(_HeaderBlock, {
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
  isEmpty: (d) => !d.text?.trim(),
  tune: [
    {
      icon: {
        text: 'H1',
        svg: h1,
        isActive: (data) => data.level === 1,
      },
      updater: (data) => ({ ...data, level: 1 }),
    },
    {
      icon: {
        text: 'H2',
        svg: h2,
        isActive: (data) => data.level === 2,
      },
      updater: (data) => ({ ...data, level: 2 }),
    },
    {
      icon: {
        text: 'H3',
        svg: h3,
        isActive: (data) => data.level === 3,
      },
      updater: (data) => ({ ...data, level: 3 }),
    },
  ],
});
