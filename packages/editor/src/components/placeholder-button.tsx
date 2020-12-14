import { styled } from '@hexx/theme';
export const PlaceholderButton = styled('div', {
  position: 'relative',
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
  ':hover': {
    opacity: 0.8
  },

  variants: {
    icon: {
      leftIcon: {
        svg: {
          fontSize: 24,
          paddingRight: 8,
        },
      },
    },
  },
});
