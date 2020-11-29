import { useAtom } from 'jotai';
import { useEffect, useRef } from 'react';
import { isSelectAllAtom } from 'src/constants/atom';
import { useEditor } from 'src/hooks/use-editor';
import { css } from 'src/stitches.config';
import { lastCursor } from 'src/utils/find-blocks';
import { Editable } from '../editable';
import { BlockType } from '../editor';
import { text as TextIcon } from '../icons';
import { BlockProps } from './block';

export function TextBlock({ index, block }: BlockProps) {
  const ref = useRef<HTMLDivElement>(null);
  const {
    insertBlock,
    removeBlockWithId,
    updateBlockDataWithId,
  } = useEditor();

  useEffect(() => {
    ref.current?.focus();
    lastCursor();
  }, []);

  const props = {
    ref,
    html: block.data.text || '',
    onChange: (evt) => {
      updateBlockDataWithId({
        id: block.id,
        data: {
          ...block.data,
          text: evt.target.value,
        },
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
