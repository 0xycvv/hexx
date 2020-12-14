import { styled } from '@hexx/theme';
export const PlaceholderButton = styled('div', {
  backgroundColor: '$gray200',
  borderRadius: 4,
  color: '$gray500',
  fontSize: 16,
  lineHeight: '24px',
  padding: '16px 24px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  userSelect: 'none',

  variants: {
    icon: {
      svg: {
        fontSize: 24,
        paddingRight: 8,
      },
    },
  },
});
