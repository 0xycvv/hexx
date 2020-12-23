import { StitchesProps, styled } from '@hexx/theme';
import { ReactNode, useCallback } from 'react';
import { SelectionChangePlugin } from '../../plugins';
import { generateGetBoundingClientRect } from '../../utils/virtual-element';
import Bold from '../icons/bold';
import Italic from '../icons/italic';
import Underlined from '../icons/underlined';
import { PortalPopper } from '../popper/portal-popper';
import { useReactPopper } from '../popper/use-react-popper';
import { useDefaultInlineTool, UseInlineToolConfig } from './hooks';
import { InlineLink } from './link/link';

const Wrapper = styled('div', {
  display: 'grid',
  gridAutoFlow: 'column',
  gridTemplateRows: 'repeat(auto-fill)',
  gap: 16,
  background: '$bg',
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
  color: '$text',
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
        color: '$text',
      },
    },
  },
  ':hover': {
    color: '$gray500',
  },
});

function DefaultInlineTool({
  type,
  shortcut,
  onToggle,
  ...props
}: UseInlineToolConfig & {
  children: ReactNode;
} & StitchesProps<typeof IconWrapper>) {
  const { getProps } = useDefaultInlineTool({
    type,
    shortcut,
    onToggle,
  });
  return (
    <IconWrapper {...props} {...getProps}>
      {props.children}
    </IconWrapper>
  );
}

export function InlineToolBar({
  children,
  ...props
}: { children?: ReactNode } & StitchesProps<typeof Wrapper>) {
  return <Wrapper {...props}>{children}</Wrapper>;
}

export function InlineBold(props: StitchesProps<typeof IconWrapper>) {
  return (
    <DefaultInlineTool
      shortcut="⌘ + b"
      type="bold"
      onToggle={() => {
        document.execCommand('bold', false);
      }}
      {...props}
    >
      <Bold title="bold" />
    </DefaultInlineTool>
  );
}

export function InlineItalic(
  props: StitchesProps<typeof IconWrapper>,
) {
  return (
    <DefaultInlineTool
      shortcut="⌘ + i"
      type="italic"
      onToggle={() => {
        document.execCommand('italic', false);
      }}
      {...props}
    >
      <Italic title="italic" />
    </DefaultInlineTool>
  );
}

export function InlineUnderline(
  props: StitchesProps<typeof IconWrapper>,
) {
  return (
    <DefaultInlineTool
      shortcut="⌘ + u"
      type="underline"
      {...props}
      onToggle={() => {
        document.execCommand('underline', false);
      }}
    >
      <Underlined title="underline" />
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
      {children}
    </Wrapper>
  );
}

export function InlineTool({ children  }: { children?: ReactNode }) {
  const popper = useReactPopper({
    placement: 'bottom-start',
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [0, 8],
        },
      },
    ],
  });
  const selectionChange = useCallback((range: Range) => {
    if (range.collapsed) {
      popper.setActive(false);
      return;
    }
    const rect = range.getBoundingClientRect();
    if (rect) {
      if (!popper.active) {
        popper.setActive(true);
      }
      popper.setReferenceElement({
        getBoundingClientRect: generateGetBoundingClientRect(rect),
      });
    }
  }, []);

  return (
    <>
      <SelectionChangePlugin onSelectionChange={selectionChange} />
      <PortalPopper popper={popper}>
        <InlineToolBarPreset
          css={{
            borderRadius: '0px 26px 26px 26px',
          }}
        >
          {children}
        </InlineToolBarPreset>
      </PortalPopper>
    </>
  );
}
