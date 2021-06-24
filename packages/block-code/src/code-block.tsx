import {
  composeRef,
  lastCursor,
  useBlock,
  applyBlock,
  BlockProps,
  useEditable,
} from '@hexx/editor';
import * as React from 'react';
import { codeBlockStyle, TCodeBlock } from './renderer';
import SvgCode from './svg';
import { css, styled } from '@hexx/theme';

const CodeEditable = styled('code', {
  display: 'block',
  whiteSpace: 'pre',
});

function _CodeBlock({
  id,
  index,
  config,
  blockAtom,
}: BlockProps<{ placeholder?: string }>) {
  const { update, register, block } = useBlock(blockAtom, index);
  const ref = React.useRef<HTMLDivElement>(null);

  useEditable(ref, (html) => {
    update({
      ...block,
      data: {
        ...block.data,
        value: html,
      },
    });
  });

  React.useEffect(() => {
    ref.current?.focus();
    lastCursor();
  }, []);

  console.log('render, code');

  const codeClassName = block.data.lang
    ? `language-${block.data.lang}`
    : 'language-';

  return (
    <pre className={`${css(codeBlockStyle)()} ${codeClassName}`}>
      <CodeEditable
        className={codeClassName}
        contentEditable
        ref={composeRef(ref, register)}
        suppressContentEditableWarning
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.stopPropagation();
          }
          if (e.key === 'Tab') {
            document.execCommand('insertText', false, '  ');
            e.preventDefault();
          }
        }}
        placeholder={config?.placeholder || 'Code...'}
      >
        {block.data.value}
      </CodeEditable>
    </pre>
  );
}

export const CodeBlock = applyBlock<
  TCodeBlock['data'],
  { placeholder: string }
>(_CodeBlock, {
  type: 'code',
  isEmpty: (d) => !d.value?.trim(),
  icon: {
    text: 'Code Block',
    svg: SvgCode,
  },
  mdast: {
    type: 'code',
    in: ({ lang, value }) => ({ value, lang }),
  },
  config: {
    placeholder: 'Code...',
  },
  defaultValue: {
    value: '',
  },
});
