import * as React from 'react';
import ReactHtmlParser from 'react-html-parser';
import { css, CSS } from '@hexx/theme';

export type Quote = {
  type: 'quote';
  data: {
    alignment?: string;
    caption?: string;
    text: string;
  };
};

export const quoteStyle = {
  wrapper: {
    paddingLeft: '24px',
    paddingRight: '24px',
    paddingTop: 3,
    paddingBottom: 3,
  } as CSS,
  text: {
    borderTop: 'none',
    borderRight: 'none',
    borderBottom: 'none',
    borderImage: 'initial',
    borderLeft: '2px solid rgb(36, 37, 38)',
    boxShadow: 'none',
    borderRadius: 0,
    marginTop: 8,
    marginBottom: 8,
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 16,
    paddingRight: 12,
    fontSize: '1rem',
    lineHeight: '20px',
    fontStyle: 'italic',
    color: 'rgb(36, 37, 38)',
    minHeight: 'unset !important',
  } as CSS,
};

export const QuoteRenderer = ({ data }: { data: Quote['data'] }) => {
  return (
    <blockquote className={css(quoteStyle.wrapper)()}>
      <div className={css(quoteStyle.text)()}>
        {ReactHtmlParser(data.text)}
      </div>
    </blockquote>
  );
};
