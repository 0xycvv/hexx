import { composeRef, lastCursor, useBlock } from '@hexx/editor';
import { BlockProps, Editable } from '@hexx/editor/components';
import { applyBlock, css } from '@hexx/theme';
import * as React from 'react';
import { codeBlockStyle } from './renderer';
import SvgCode from './svg';

const _CodeBlock = React.memo<BlockProps>(function _CodeBlock({
  id,
  index,
}) {
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
    <pre className={css(codeBlockStyle)}>
      <code className={codeClassName}>
        <Editable
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
      </code>
    </pre>
  );
});

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
