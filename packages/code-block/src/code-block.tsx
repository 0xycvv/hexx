import { useEffect, useRef, forwardRef } from 'react';
import { useBlock, composeRef, lastCursor } from '@hexx/editor';
import { Editable, BlockProps } from '@hexx/editor/components';

function SvgAddImage({ title, titleId, ...props }, svgRef) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      ref={svgRef}
      aria-labelledby={titleId}
      {...props}
    >
      {title ? <title id={titleId}>{title}</title> : null}
      <path
        d="M16 21l-4.762-8.73L15 6l8 15h-7zM8 10l6 11H2l6-11zM5.5 8a2.5 2.5 0 110-5 2.5 2.5 0 010 5z"
        fill="currentColor"
      />
    </svg>
  );
}

const SvgAddImageF = forwardRef(SvgAddImage);

export function CodeBlock({ block, config, index }: BlockProps) {
  const { update, register } = useBlock(block.id, index);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.focus();
    lastCursor();
  }, []);

  const codeClassName = block.data.language
    ? `language-${block.data.language}`
    : 'language-';

  return (
    <pre>
      <code className={codeClassName}>
        <Editable
          placeholder={''}
          onChange={(evt) => {
            update({
              ...block.data,
              code: evt.target.value,
            });
          }}
          ref={composeRef(ref, register)}
          html={block.data.code}
        />
      </code>
    </pre>
  );
}

CodeBlock.block = {
  type: 'code',
  icon: {
    text: 'Code Block',
    svg: SvgAddImageF,
  },
  defaultValue: {
    code: '',
  },
  paste: {
    tags: ['pre'],
    onPaste: (ast, toDOM) => ({
      code: toDOM(ast).outerHTML,
    }),
  },
  isEmpty: (d) => !d.code.trim(),
};
