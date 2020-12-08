import { css, StitchesStyleObject } from '@hexx/theme';
import ReactHtmlParser from 'react-html-parser';

export type CodeBlock = {
  type: 'code';
  data: {
    code: string;
  };
};

export const codeBlockStyle: StitchesStyleObject = {};

export const CodeBlockRenderer = ({
  data,
}: {
  data: CodeBlock['data'];
}) => {
  return (
    <pre className={css(codeBlockStyle)}>
      <code>{ReactHtmlParser(data.code)}</code>
    </pre>
  );
};
