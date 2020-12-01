import * as React from 'react';
import { dividerStyles } from '@elliot/renderer';
import { divider as DividerSvg } from '../icons';
import { css } from '@elliot/theme';

const styles = css(dividerStyles);

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
