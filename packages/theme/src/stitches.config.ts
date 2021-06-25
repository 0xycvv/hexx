import {
  createCss,
  TCssProp,
  StitchesProps,
  TCssWithBreakpoints,
} from '@stitches/react';

const config = {
  prefix: 'hexx',
  theme: {
    colors: {
      text: '#000000',
      bg: 'white',
      gray200: '#E6E8E9',
      gray500: '#9B9FA4',
      link: '#0278E4',
      success: '#2BC3A8',
      highlight: '#E4B202',
    },
    space: {
      1: '4px',
      2: '8px',
      3: '12px',
      4: '16px',
      5: '20px',
      6: '24px',
    },
  },
};

export const { css, styled, global, getCssString } = createCss(
  config,
);

export type { StitchesProps };

export type StitchesStyleObject = Record<
  string,
  TCssProp<typeof config>
>;

export type StitchesCssProp = TCssWithBreakpoints<typeof config>;
