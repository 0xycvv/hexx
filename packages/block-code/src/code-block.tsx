import { applyBlock, BlockProps, useBlock } from '@hexx/editor';
import { styled } from '@hexx/theme';
import Highlight, { Prism, PrismTheme } from 'prism-react-renderer';
import * as React from 'react';
import Editor from 'react-simple-code-editor';
import { codeBlockStyle, TCodeBlock } from './renderer';
import SvgCode from './svg';

const Code = styled('code', {
  display: 'block',
  whiteSpace: 'pre',
  minHeight: '24px',
});

type Config = {
  placeholder?: string;
  theme?: PrismTheme;
};

function _CodeBlock({ config, blockAtom }: BlockProps<Config>) {
  const { update, block } = useBlock(blockAtom);

  const { padding, ...restCodeBlockStyle } = codeBlockStyle;

  const onChange = React.useCallback(
    (html) => {
      update({
        ...block,
        data: {
          ...block.data,
          value: html,
        },
      });
    },
    [update],
  );

  const highlightCode = React.useCallback(
    (code: string) => {
      return (
        <Highlight
          Prism={Prism}
          theme={config?.theme}
          code={code}
          language={block.data.lang}
        >
          {({ tokens, getLineProps, getTokenProps }) => (
            <Code>
              {tokens.map((line, i) => (
                // eslint-disable-next-line react/jsx-key
                <div {...getLineProps({ line, key: i })}>
                  {line.map((token, key) => (
                    // eslint-disable-next-line react/jsx-key
                    <span {...getTokenProps({ token, key })} />
                  ))}
                </div>
              ))}
            </Code>
          )}
        </Highlight>
      );
    },
    [block.data.lang],
  );

  return (
    <Editor
      value={block.data.value}
      onValueChange={onChange}
      highlight={highlightCode}
      padding={padding as string}
      style={restCodeBlockStyle as any}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.stopPropagation();
        }
        if (e.key === 'Backspace') {
          e.stopPropagation();
        }
      }}
    />
  );
}

export const CodeBlock = applyBlock<TCodeBlock['data'], Config>(
  _CodeBlock,
  {
    type: 'code',
    isEmpty: (d) => !d.value?.trim(),
    icon: {
      text: 'Code Block',
      svg: SvgCode,
    },
    config: {
      placeholder: 'Code...',
    },
    defaultValue: {
      value: '',
    },
  },
);

export const codeMdast = {
  type: 'code',
  blockType: 'code',
  in: ({ lang, value }) => ({ value, lang }),
};
