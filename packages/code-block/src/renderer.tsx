import { css, StitchesCssProp } from '@hexx/editor';
import ReactHtmlParser from 'react-html-parser';

export type TCodeBlock = {
  type: 'code';
  data: {
    value: string;
    lang?: string;
  };
};

export const codeBlockStyle: StitchesCssProp = {
  backgroundColor: '#DAE5F4',
  color: '#0148D1',
  padding: '24px 32px',
  borderRadius: '4px',
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
