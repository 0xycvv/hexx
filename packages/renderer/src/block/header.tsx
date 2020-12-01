// @ts-ignore
import ReactHtmlParser from 'react-html-parser';
import { css, StitchesStyleObject, styled } from '@elliot/theme';
import * as React from 'react';

export type Header = {
  type: 'header';
  data: {
    level: 1 | 2 | 3 | 4 | 5 | 6;
    text: string;
  };
};

export const headerStyle: StitchesStyleObject = {
  padding: '1em 0',
  lineHeight: '1.5em',
  outline: 'none',
  variants: {
    h: {
      1: {
        fontSize: '40px',
        lineHeight: '40px',
        fontWeight: 'bold',
      },
      2: {
        fontSize: '32px',
        fontWeight: 'bold',
        lineHeight: '38px',
      },
      3: {
        fontSize: '24px',
        lineHeight: '32px',
        fontWeight: 'bold',
      },
      4: {
        fontSize: '20px',
        lineHeight: '24px',
        fontWeight: 'bold',
      },
      5: {
        fontSize: '16px',
        lineHeight: '20px',
        fontWeight: 'bold',
      },
      6: {
        fontSize: '14px',
        lineHeight: '18px',
        fontWeight: 'bold',
      },
    },
  },
};

const Heading = styled('h3', headerStyle);

export const HeaderRenderer = ({
  data,
}: {
  data: Header['data'];
}) => {
  const level = data.level || 3;
  return (
    <Heading as={`h${level}` as any} h={level}>
      {ReactHtmlParser(data.text)}
    </Heading>
  );
  let result = (
    <h4 className={css(headerStyle)}>{ReactHtmlParser(data.text)}</h4>
  );
  switch (data.level) {
    case 1:
      result = (
        <h1 className={css(headerStyle)}>
          {ReactHtmlParser(data.text)}
        </h1>
      );
      break;
    case 2:
      result = (
        <h2 className={css(headerStyle)}>
          {ReactHtmlParser(data.text)}
        </h2>
      );
      break;
    case 3:
      result = (
        <h3 className={css(headerStyle)}>
          {ReactHtmlParser(data.text)}
        </h3>
      );
      break;
    case 4:
      result = (
        <h4 className={css(headerStyle)}>
          {ReactHtmlParser(data.text)}
        </h4>
      );
      break;
    case 5:
      result = (
        <h5 className={css(headerStyle)}>
          {ReactHtmlParser(data.text)}
        </h5>
      );
      break;
    case 6:
      result = (
        <h6 className={css(headerStyle)}>
          {ReactHtmlParser(data.text)}
        </h6>
      );
      break;
    default:
      break;
  }
  return result;
};
