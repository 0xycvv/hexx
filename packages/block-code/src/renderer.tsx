import { StitchesCssProp, StitchesProps, styled } from '@hexx/theme';
import Highlight, {
  Language,
  Prism,
  PrismTheme,
} from 'prism-react-renderer';

export type TCodeBlock = {
  type: 'code';
  data: {
    value: string;
    lang?: string;
  };
};

export const codeBlockStyle: StitchesCssProp = {
  fontFamily: 'monospace',
  padding: '24px',
  borderRadius: '4px',
  background: '#f5f2f0',
  whiteSpace: 'pre',
  overflow: 'scroll',
};
const Pre = styled('pre', codeBlockStyle);
const Code = styled('code', {});

export const CodeBlockRenderer = ({
  data,
}: {
  data: TCodeBlock['data'];
}) => {
  return (
    <Highlight
      Prism={Prism}
      code={data.value}
      language={data.lang as Language}
    >
      {({ tokens, getLineProps, getTokenProps }) => (
        <Pre>
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
        </Pre>
      )}
    </Highlight>
  );
};
