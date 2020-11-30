import { css } from '@elliot/theme';
import * as React from 'react';

export type Delimiter = {
  type: 'delimiter';
  data: {};
};

const styles = css({
  lineHeight: '1.6em',
  width: '100%',
  textAlign: 'center',
  '::before': {
    display: 'inline-block',
    content: `'***'`,
    fontSize: '30px',
    lineHeight: '65px',
    height: '30px',
    letterSpacing: '0.2em',
  },
});

export const DelimiterRenderer = () => {
  return <div role="separator" className={styles} />;
};
