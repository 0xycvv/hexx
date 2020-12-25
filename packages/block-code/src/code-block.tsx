import {
  composeRef,
  lastCursor,
  useBlock,
  applyBlock,
  BlockProps,
} from '@hexx/editor';
import { Editable } from '@hexx/editor/components';
import * as React from 'react';
import { codeBlockStyle, TCodeBlock } from './renderer';
import SvgCode from './svg';
import { css } from '@hexx/theme';

const _CodeBlock = React.memo(function _CodeBlock({
  id,
  index,
}: BlockProps) {
  const { update, register, block } = useBlock(id, index);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    ref.current?.focus();
    lastCursor();
  }, []);

  const codeClassName = block.data.lang
    ? `language-${block.data.lang}`
    : 'language-';

  return (
    <pre className={`${css(codeBlockStyle)} ${codeClassName}`}>
      <Editable
        css={{
          display: 'block',
          whiteSpace: 'pre',
        }}
        className={codeClassName}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.stopPropagation();
          }
          if (e.key === 'Tab') {
            document.execCommand('insertText', false, '  ');
            e.preventDefault();
          }
        }}
        tagName="code"
        placeholder={'<code-block></code-block>'}
        onChange={(evt) => {
          update({
            ...block,
            data: {
              ...block.data,
              value: evt.target.value,
            },
          });
        }}
        ref={composeRef(ref, register)}
        html={block.data.value}
      />
    </pre>
  );
});

export const CodeBlock = applyBlock<TCodeBlock['data'], {}>(
  _CodeBlock,
  {
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
    defaultValue: {
      value: '',
    },
  },
);
