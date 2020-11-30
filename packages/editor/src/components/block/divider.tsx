import * as React from 'react';
import { divider as DividerSvg } from '../icons';
import { css } from '@elliot/theme';

const styles = css({
  lineHeight: '1.6em',
  width: '100%',
  textAlign: 'center',
  '::before': {
    display: 'inline-block',
    color: '##C4C4C4',
    content: `'・・・'`,
    fontSize: '30px',
    lineHeight: '38px',
    letterSpacing: '0.2em',
  },
});

export function Divider() {
  return <div role="separator" className={styles} />;
}

Divider.block = {
  type: 'delimiter',
  icon: {
    text: 'Divider',
    svg: DividerSvg,
  },
  defaultValue: {},
};
