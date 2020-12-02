import * as React from 'react';
// @ts-ignore
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
    code: {
      background: 'rgba(1, 72, 209, 0.1)',
      color: '#0148D1',
      padding: '1px 6px',
      borderRadius: 6,
      margin: '0 1px',
      fontFamily: 'inherit',
    },
    mark: {
      background: 'rgba(228, 178, 2, 0.18)',
      padding: '3px 0',
    },
    a: {
      cursor: 'pointer',
      textDecoration: 'underline',
      color: 'inherit',
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
