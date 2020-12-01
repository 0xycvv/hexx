import {
  createStyled,
  TCssProp,
  StitchesProps,
} from '@stitches/react';

const config = {
  prefix: 'elliot',
  tokens: {
    colors: {
      '$text-1': '#000000',
      '$bg-1': 'white',
      $gay500: '#9B9FA4',
      $link: '#0278E4',
      $success: '#2BC3A8',
      $highlight: '#E4B202'
    },
    space: {
      $1: '4px',
      $2: '8px',
      $3: '12px',
      $4: '16px',
      $5: '20px',
      $6: '24px',
    },
    breakpoints: {
      bp1: (rule) => `@media (min-width: 640px) { ${rule} }`,
      bp2: (rule) => `@media (min-width: 768px) { ${rule} }`,
      bp3: (rule) => `@media (min-width: 1024px) { ${rule} }`,
      bp4: (rule) => `@media (min-width: 1280px) { ${rule} }`,
    },
  },
} as const;

export const { css, styled } = createStyled(config);

export type { StitchesProps };

// export type StitchesCssProp = TCssProp<typeof config>;
export type StitchesStyleObject = Record<
  string,
  TCssProp<typeof config>
>;
