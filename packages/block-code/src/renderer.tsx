import { css, StitchesCssProp } from '@hexx/theme';
import ReactHtmlParser from 'react-html-parser';

export type TCodeBlock = {
  type: 'code';
  data: {
    value: string;
    lang?: string;
  };
};

export const codeBlockStyle: StitchesCssProp = {
  fontFamily: 'monospace',
  padding: '24px 32px',
  borderRadius: '4px',
  whiteSpace: 'pre',
  overflow: 'scroll'
};

export const CodeBlockRenderer = ({
  data,
}: {
  data: TCodeBlock['data'];
}) => {
  return (
    <pre className={css(codeBlockStyle)}>
      <code>{ReactHtmlParser(data.value)}</code>
    </pre>
  );
};
