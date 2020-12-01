import { StitchesProps, styled } from '@elliot/theme';
import { Children, ReactNode } from 'react';
import Bold from '../icons/bold';
import Italic from '../icons/italic';
import Underlined from '../icons/underlined';
import { useDefaultInlineTool, UseInlineToolConfig } from './hooks';
import { InlineLink } from './link/link';

const Wrapper = styled('div', {
  display: 'grid',
  gridAutoFlow: 'column',
  gridTemplateRows: 'repeat(auto-fill)',
  gap: 16,
  background: '$bg-1',
  borderRadius: 8,
  paddingLeft: 18,
  paddingRight: 18,
  paddingTop: '14px',
  paddingBottom: '14px',
  border: '1px solid #D3D6D8',
  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.06)',
  zIndex: 999,
});

export const IconWrapper = styled('div', {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontSize: 24,
  color: '$text-1',
  paddingLeft: 6,
  paddingRight: 6,
  cursor: 'pointer',
  variants: {
    color: {
      active: {
        color: '$success',
        ':hover': {
          color: '$success',
        },
      },
      inactive: {
        color: '$text-1',
      },
    },
  },
  ':hover': {
    color: '$gay500',
  },
});

function DefaultInlineTool(
  props: UseInlineToolConfig & { children: ReactNode },
) {
  const { getProps } = useDefaultInlineTool(props);
  return <IconWrapper {...getProps()}>{props.children}</IconWrapper>;
}

export function InlineToolBar({
  children,
  ...props
}: { children?: ReactNode } & StitchesProps<typeof Wrapper>) {
  return <Wrapper {...props}>{children}</Wrapper>;
}

export function InlineBold() {
  return (
    <DefaultInlineTool
      type="bold"
      onClick={() => {
        document.execCommand('bold', false);
      }}
    >
      <Bold />
    </DefaultInlineTool>
  );
}

export function InlineItalic() {
  return (
    <DefaultInlineTool
      type="italic"
      onClick={() => {
        document.execCommand('italic', false);
      }}
    >
      <Italic />
    </DefaultInlineTool>
  );
}

export function InlineUnderline() {
  return (
    <DefaultInlineTool
      type="underline"
      onClick={() => {
        document.execCommand('underline', false);
      }}
    >
      <Underlined />
    </DefaultInlineTool>
  );
}

export { InlineLink };

export function InlineToolBarPreset({
  children,
  ...props
}: { children?: ReactNode } & StitchesProps<typeof Wrapper>) {
  return (
    <Wrapper {...props}>
      <InlineBold />
      <InlineItalic />
      <InlineUnderline />
      <InlineLink />
      {children}
    </Wrapper>
  );
}
