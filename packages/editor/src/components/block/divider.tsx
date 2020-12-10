import * as React from 'react';
import { dividerStyles, Delimiter } from '@hexx/renderer';
import { divider as DividerSvg } from '../icons';
import { css, applyBlock } from '@hexx/theme';

const styles = css(dividerStyles);

export const Divider = applyBlock(
  // @ts-ignore
  React.memo(() => {
    return <div role="separator" className={styles} />;
  }),
  {
    type: 'delimiter',
    icon: {
      text: 'Divider',
      svg: DividerSvg,
    },
    mdast: {
      type: 'thematicBreak',
    },
    defaultValue: {},
  },
);
