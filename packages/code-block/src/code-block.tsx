import { composeRef, lastCursor, useBlock } from '@hexx/editor';
import { BlockProps, Editable } from '@hexx/editor/components';
import { css } from '@hexx/theme';
import { useEffect, useRef } from 'react';
import { codeBlockStyle } from './renderer';
import SvgCode from './svg';

export function CodeBlock({ block, config, index }: BlockProps) {
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

CodeBlock.block = {
  type: 'code',
  icon: {
    text: 'Code Block',
    svg: SvgCode,
  },
  mdast: {
    type: 'code',
    in: ({ lang, value }) => ({ value, lang }),
  },
  defaultValue: {
    code: '',
  },
  isEmpty: (d) => !d.code?.trim(),
};
