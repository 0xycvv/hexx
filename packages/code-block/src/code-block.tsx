import { composeRef, lastCursor, useBlock } from '@hexx/editor';
import { BlockProps, Editable } from '@hexx/editor/components';
import { css, applyBlock } from '@hexx/theme';
import { useEffect, useRef } from 'react';
import { codeBlockStyle, TCodeBlock } from './renderer';
import SvgCode from './svg';

function _CodeBlock({
  block,
  index,
}: BlockProps<TCodeBlock['data']>) {
  const { update, register } = useBlock(block.id, index);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.focus();
    lastCursor();
  }, []);

  const codeClassName = block.data.lang
    ? `language-${block.data.lang}`
    : 'language-';

  return (
    <pre className={css(codeBlockStyle)}>
      <code className={codeClassName}>
        <Editable
          placeholder={'<code-block></code-block>'}
          onChange={(evt) => {
            update({
              ...block.data,
              value: evt.target.value,
            });
          }}
          ref={composeRef(ref, register)}
          html={block.data.value}
        />
      </code>
    </pre>
  );
}

export const CodeBlock = applyBlock(_CodeBlock, {
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
});
