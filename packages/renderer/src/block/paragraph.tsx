import * as React from 'react';
// @ts-ignore
import ReactHtmlParser from 'react-html-parser';
import { css, StitchesStyleObject } from '@elliot/theme';
export type Paragraph = {
  type: 'paragraph';
  data: {
    alignment?: 'left' | 'center' | 'right';
    text: string;
  };
};

export const paragraphStyle: StitchesStyleObject = {
  p: {
    lineHeight: '1.6em',
    outline: 'none',
    code: {
      background: 'rgba(250, 239, 240, 0.78)',
      color: '#b44437',
      padding: '3px 4px',
      borderRadius: 5,
      margin: '0 1px',
      fontFamily: 'inherit',
      fontSize: '0.86em',
      fontWeight: 500,
      letterSpacing: 0.3,
    },
    mark: {
      background: 'rgba(1, 72, 209, 0.2)',
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
