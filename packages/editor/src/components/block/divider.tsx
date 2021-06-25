import { DelimiterRenderer } from '@hexx/renderer';
import * as React from 'react';
import { applyBlock } from '../../utils/blocks';
import { divider as DividerSvg } from '../icons';

const Render = () => <DelimiterRenderer />;

export const Divider = applyBlock<{}, {}>(Render, {
  type: 'delimiter',
  icon: {
    text: 'Divider',
    svg: DividerSvg,
  },
  mdast: {
    type: 'thematicBreak',
  },
  defaultValue: {},
});
