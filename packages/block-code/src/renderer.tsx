import { StitchesCssProp, StitchesProps, styled } from '@hexx/theme';

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
  overflow: 'scroll',
};

const Pre = styled('pre', codeBlockStyle);
const Code = styled('code', {});

export const CodeBlockRenderer = ({
  data,
  ...props
}: {
  data: TCodeBlock['data'];
} & StitchesProps<typeof Pre>) => {
  const codeClassName = data.lang
    ? `language-${data.lang}`
    : 'language-';
  return (
    <Pre {...props}>
      <Code className={codeClassName}>{data.value}</Code>
    </Pre>
  );
};
