import * as React from 'react';
import ReactHtmlParser from 'react-html-parser';
import { css, StitchesStyleObject } from '@hexx/theme';
export type Paragraph = {
  type: 'paragraph';
  data: {
    alignment?: 'left' | 'center' | 'right';
    text: string;
  };
};

export const paragraphStyle: StitchesStyleObject = {
  p: {
    lineHeight: '24px',
    fontSize: '16px',
    outline: 'none',
    mark: {
      background: 'rgba(228, 178, 2, 0.18)',
      padding: '3px 0',
    },
    a: {
      cursor: 'pointer',
      textDecoration: 'underline',
    },
  },
};

export const ParagraphRenderer = ({
  data,
}: {
  data: Paragraph['data'];
}) => {
  return (
    <p
      className={css(paragraphStyle)}
      style={{ textAlign: data.alignment || 'left' }}
    >
      {ReactHtmlParser(data.text)}
    </p>
  );
};
