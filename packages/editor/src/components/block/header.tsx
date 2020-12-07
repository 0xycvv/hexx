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
  paste: {
    onPaste: (ast, toDOM) => {
      let level = 3;
      switch (ast.tagName) {
        case 'h1':
          level = 1;
          break;
        case 'h2':
          level = 2;
          break;
        case 'h3':
          level = 3;
          break;
        case 'h4':
          level = 4;
          break;
        case 'h5':
          level = 5;
          break;
        case 'h6':
          level = 6;
          break;
        default:
          break;
      }
      return {
        level,
        text: toDOM(ast).innerHTML,
      };
    },
    tags: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    html: ['text'],
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
