import { css, StitchesStyleObject } from '@hexx/theme';
import * as React from 'react';

export type Delimiter = {
  type: 'delimiter';
  data: {};
};

export const dividerStyles: StitchesStyleObject = {
  lineHeight: '1.6em',
  width: '100%',
  height: 'auto',
  textAlign: 'center',
  margin: 'unset',
  borderStyle: 'none',
  '::before': {
    display: 'inline-block',
    color: '#C4C4C4',
    content: `'・・・'`,
    fontSize: '30px',
    lineHeight: '38px',
    letterSpacing: '0.2em',
  },
};

export const DelimiterRenderer = () => {
  return <hr role="separator" className={css(dividerStyles)()} />;
};
