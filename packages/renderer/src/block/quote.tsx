import * as React from 'react';
import { css } from '@elliot/theme';

export type Quote = {
  type: 'quote';
  data: {
    alignment?: string;
    caption: string;
    text: string;
  };
};

const styles = {
  wrapper: {
    paddingLeft: '24px',
    paddingRight: '24px',
  },
  text: {
    borderTop: 'none',
    borderRight: 'none',
    borderBottom: 'none',
    borderImage: 'initial',
    borderLeft: '2px solid rgb(36, 37, 38)',
    boxShadow: 'none',
    borderRadius: 0,
    marginBottom: 10,
    padding: '10px 12px',
    fontSize: '1rem',
    lineHeight: '20px',
    fontStyle: 'italic',
    color: 'rgb(36, 37, 38)',
    paddingLeft: 16,
    minHeight: 'unset !important',
  },
};

export const QuoteRenderer = ({ data }: { data: Quote['data'] }) => {
  return (
    <blockquote className={css(styles.wrapper)}>
      <div className={css(styles.text)}>{data.text}</div>
    </blockquote>
  );
};
