import * as mdast from 'mdast';
import { headerStyle, Header } from '@hexx/renderer';
import { styled, BlockProps, applyBlock } from '@hexx/theme';
import * as React from 'react';
import composeRefs from '../../hooks/use-compose-ref';
import { useBlock } from '../../hooks/use-editor';
import { lastCursor } from '../../utils/find-blocks';
import { Editable } from '../editable';
import { header as HeaderSvg } from '../icons';

const Heading = styled(Editable, headerStyle);

function _HeaderBlock({
  id,
  index,
  config,
}: BlockProps<{ placeholder: string }>) {
  const { register, update, block } = useBlock(id, index);

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
          ...block,
          data: {
            ...block.data,
            text: evt.target.value,
          },
        })
      }
      html={block.data.text}
    />
  );
}

// @ts-ignore
export const HeaderBlock = applyBlock(React.memo(_HeaderBlock), {
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
});
