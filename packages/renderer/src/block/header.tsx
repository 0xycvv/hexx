// @ts-ignore
import ReactHtmlParser from 'react-html-parser';
import { css } from '@elliot/theme';
import * as React from 'react';

export type Header = {
  type: 'header';
  data: {
    level: 1 | 2 | 3 | 4 | 5 | 6 | number;
    text: string;
  };
};

export const headerStyle = {
  padding: '1em 0',
  lineHeight: '1.5em',
  outline: 'none',
};

export const HeaderRenderer = ({
  data,
}: {
  data: Header['data'];
}) => {
  let result = (
    <h4 className={css(headerStyle)}>{ReactHtmlParser(data.text)}</h4>
  );
  switch (data.level) {
    case 1:
      result = (
        <h1 className={css(headerStyle)}>{ReactHtmlParser(data.text)}</h1>
      );
      break;
    case 2:
      result = (
        <h2 className={css(headerStyle)}>{ReactHtmlParser(data.text)}</h2>
      );
      break;
    case 3:
      result = (
        <h3 className={css(headerStyle)}>{ReactHtmlParser(data.text)}</h3>
      );
      break;
    case 4:
      result = (
        <h4 className={css(headerStyle)}>{ReactHtmlParser(data.text)}</h4>
      );
      break;
    case 5:
      result = (
        <h5 className={css(headerStyle)}>{ReactHtmlParser(data.text)}</h5>
      );
      break;
    case 6:
      result = (
        <h6 className={css(headerStyle)}>{ReactHtmlParser(data.text)}</h6>
      );
      break;
    default:
      break;
  }
  return result;
};
