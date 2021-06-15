import { DelimiterRenderer } from '@hexx/renderer';
import * as React from 'react';
import { applyBlock } from '../../utils/blocks';
import { divider as DividerSvg } from '../icons';

export const Divider = applyBlock<{}, {}>(
  // @ts-ignore
  React.memo(() => {
    return <DelimiterRenderer />;
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
