import * as React from 'react';
// @ts-ignore
import ReactHtmlParser from 'react-html-parser';
import { css } from '@elliot/theme';
export type List = {
  type: 'list';
  data: {
    style: 'ordered' | 'unordered';
    items: string[];
  };
};

const commonListStyle = {
  paddingLeft: 40,
  outline: 'none',
  position: 'relative',
  left: 18,
} as const;

const styles = {
  ul: {
    listStyle: 'disc',
    ...commonListStyle,
  },
  ol: {
    listStyle: 'decimal',
    ...commonListStyle,
  },
  item: {
    padding: '5.5px 0 5.5px 3px',
    lineHeight: '1.6em',
  },
};

export const ListRenderer = ({ data }: { data: List['data'] }) => {
  let listItems = React.Children.toArray(
    data.items.map((item) => (
      <li className={css(styles.item)}>{ReactHtmlParser(item)}</li>
    )),
  );
  if (data.style === 'ordered') {
    return <ol className={css(styles.ol)}>{listItems}</ol>;
  }
  if (data.style === 'unordered') {
    return <ul className={css(styles.ul)}>{listItems}</ul>;
  }
  return null;
};
