import { KeyboardEvent, useEffect, useRef } from 'react';
import composeRefs from '../../hooks/use-compose-ref';
import { useBlock, useEditor } from '../../hooks/use-editor';
import { css } from '../../stitches.config';
import { lastCursor } from '../../utils/find-blocks';
import { Editable } from '../editable';
import { text as TextIcon } from '../icons';
import { BlockProps } from './block';

export function TextBlock({ index, block }: BlockProps) {
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

TextBlock.block = {
  type: 'paragraph',
  icon: {
    text: 'Text',
    svg: TextIcon,
  },
  defaultValue: {
    text: '',
  },
  isEmpty: (data) => !data.text.trim(),
};
