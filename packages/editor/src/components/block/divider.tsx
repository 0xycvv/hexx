import { dividerStyles } from '@hexx/renderer';
import { css } from '@hexx/theme';
import * as React from 'react';
import { applyBlock } from '../../utils/blocks';
import { divider as DividerSvg } from '../icons';

const styles = css(dividerStyles);

export const Divider = applyBlock<{}, {}>(
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
