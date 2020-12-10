import { styled } from '@hexx/theme';
import * as React from 'react';
import ReactHtmlParser from 'react-html-parser';

export type Header = {
  type: 'header';
  data: {
    level: 1 | 2 | 3 | 4 | 5 | 6;
    text: string;
  };
};

export const headerStyle = {
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
} as const;

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
};
