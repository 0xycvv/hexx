import {
  createStyled,
  TCssProp,
  StitchesProps,
  TCssWithBreakpoints,
} from '@stitches/react';

const config = {
  prefix: 'hexx',
  tokens: {
    colors: {
      $text: '#000000',
      $bg: 'white',
      $gay500: '#9B9FA4',
      $link: '#0278E4',
      $success: '#2BC3A8',
      $highlight: '#E4B202',
    },
    space: {
      $1: '4px',
      $2: '8px',
      $3: '12px',
      $4: '16px',
      $5: '20px',
      $6: '24px',
    },
  },
} as const;

export const { css, styled } = createStyled(config);

export type { StitchesProps };

export type StitchesStyleObject = Record<
  string,
  TCssProp<typeof config>
>;

export type StitchesCssProp = TCssWithBreakpoints<typeof config>;
