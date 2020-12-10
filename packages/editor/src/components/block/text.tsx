import * as mdast from 'mdast';
import { css, applyBlock, BlockProps } from '@hexx/theme';
import type { Paragraph } from '@hexx/renderer';
import { useEffect, useRef } from 'react';
import composeRefs from '../../hooks/use-compose-ref';
import { useBlock } from '../../hooks/use-editor';
import { lastCursor } from '../../utils/find-blocks';
import { Editable } from '../editable';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  text as TextIcon,
} from '../icons';

export function _TextBlock({ index, block }: BlockProps<Paragraph['data']>) {
  const ref = useRef<HTMLDivElement>(null);
  const { update, register } = useBlock(block.id, index);

  useEffect(() => {
    ref.current?.focus();
    if (!block.data.text) {
      lastCursor();
    }
  }, [block.data.text]);

  const props = {
    ref: composeRefs(ref, register),
    html: block.data.text || '',
    style: {
      textAlign: block.data.alignment || 'left',
    },
    onChange: (evt) => {
      update({
        ...block.data,
        text: evt.target.value,
      });
    },
  };

  return (
    <Editable
      className={css({
        padding: '3px 2px',
      })}
      {...props}
    />
  );
}

export const TextBlock = applyBlock(_TextBlock, {
  type: 'paragraph',
  icon: {
    text: 'Text',
    svg: TextIcon,
  },
  defaultValue: {
    text: '',
  },
  mdast: {
    type: 'paragraph',
    in: (content: mdast.Paragraph, toHTML) => ({
      text: toHTML(content).outerHTML,
    }),
  },
  tune: [
    {
      icon: {
        text: 'Left',
        svg: AlignLeft,
        isActive: (data) => data.alignment === 'left',
      },
      updater: (data) => ({ ...data, alignment: 'left' }),
    },
    {
      icon: {
        text: 'Center',
        svg: AlignCenter,
        isActive: (data) => data.alignment === 'center',
      },
      updater: (data) => ({ ...data, alignment: 'center' }),
    },
    {
      icon: {
        text: 'Right',
        svg: AlignRight,
        isActive: (data) => data.alignment === 'right',
      },
      updater: (data) => ({ ...data, alignment: 'right' }),
    },
  ],
  isEmpty: (data) => !data.text?.trim(),
});
