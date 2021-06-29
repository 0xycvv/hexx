import { Header, headerStyle } from '@hexx/renderer';
import { styled } from '@hexx/theme';
import * as mdast from 'mdast';
import * as React from 'react';
import { useBlock, useEditor } from '../../hooks/use-editor';
import { applyBlock, BlockProps } from '../../utils/blocks';
import { Editable } from '../editable';

const Heading = styled(Editable, headerStyle);

function _HeaderBlock({
  id,
  index,
  config,
  css,
  blockAtom,
}: BlockProps<{ placeholder: string }>) {
  const { splitBlock } = useEditor();
  const { update, block } = useBlock(blockAtom);

  return (
    <Heading
      h={(String(block.data.level) as any) || '3'}
      placeholder={config?.placeholder}
      onChange={(evt) =>
        update({
          ...block,
          data: {
            ...block.data,
            text: evt.target.value,
          },
        })
      }
      onKeyDown={(e) => {
        if (!e.shiftKey && e.key === 'Enter') {
          splitBlock({
            atom: blockAtom,
            updater: (s) => ({ text: s }),
          });
          e.preventDefault();
        }
      }}
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
  defaultValue: {
    text: '',
    level: 3,
  },
  isEmpty: (d) => !d.text?.trim(),
});
