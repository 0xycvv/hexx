import type { Paragraph } from '@hexx/renderer';
import { useBlock, useEditor } from '../../hooks/use-editor';
import { applyBlock, BlockProps } from '../../utils/blocks';
import { Editable } from '../editable';

function _TextBlock(props: BlockProps) {
  const { blockAtom, index } = props;
  const { splitBlock } = useEditor();
  const { update, block } = useBlock(blockAtom);

  const editableProps = {
    html: block.data.text || '',
    style: {
      textAlign: block.data.alignment || 'left',
    },
    onKeyDown: (e) => {
      if (!e.shiftKey && e.key === 'Enter') {
        splitBlock({
          atom: blockAtom,
          updater: (s) => ({ text: s }),
        });
        e.preventDefault();
      }
    },
    onChange: (evt) => {
      update((s) => ({
        ...s,
        data: {
          ...s.data,
          text: evt.target.value,
        },
      }));
    },
  };

  return <Editable {...editableProps} />;
}

export const TextBlock = applyBlock<Paragraph['data'], {}>(
  _TextBlock,
  {
    type: 'paragraph',
    defaultValue: {
      text: '',
    },
    isEmpty: (data) =>
      !data.text?.trim() ||
      // quick fix for safari
      data.text === '<br>',
  },
);
