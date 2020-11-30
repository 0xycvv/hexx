import {
  createStyled,
  TCssProp,
  StitchesProps,
} from '@stitches/react';

export const { css, styled } = createStyled({
  prefix: 'elliot',
  tokens: {
    colors: {
      '$text-1': '#000000',
      '$bg-1': 'white',
      $success: '#2BC3A8',
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
});

export type { StitchesProps };

export type StitchesStyleObject = Record<
  string,
  TCssProp<{ prefix: string }>
>;
