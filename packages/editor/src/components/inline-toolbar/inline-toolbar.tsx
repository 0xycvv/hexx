import Bold from '../icons/bold';
import AlignLeft from '../icons/align-left';
import AlignRight from '../icons/align-right';
import AlignCenter from '../icons/align-center';
import Italic from '../icons/italic';
import Link from '../icons/link';
import Underlined from '../icons/underlined';
import { surround } from '../../utils/find-blocks';
import { Children, ReactNode, useEffect, useState } from 'react';
import { useDefaultInlineTool, UseInlineToolConfig } from './hooks';
import { InlineLink } from './link/link';
import { styled, StitchesProps } from '@elliot/theme';

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
  ':hover': {
    color: '$gay500',
  },
  '&.active': {
    color: '$success',
  },
});

const inlineTools = [
  {
    type: 'bold',
    icon: <Bold />,
    onClick: () => {
      surround('bold');
    },
  },
  {
    type: 'italic',
    icon: <Italic />,
    onClick: () => {
      surround('italic');
    },
  },
  {
    type: 'underline',
    icon: <Underlined />,
    onClick: () => {
      surround('underline');
    },
  },
  {
    type: 'link',
    component: <InlineLink />,
  },
];

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
  return (
    <Wrapper {...props}>
      {Children.toArray(
        inlineTools.map((tool) => {
          if (tool.component) {
            return tool.component;
          }
          return (
            <DefaultInlineTool
              type={tool.type}
              onClick={tool.onClick}
              key={tool.type}
            >
              {tool.icon}
            </DefaultInlineTool>
          );
        }),
      )}
      {children}
    </Wrapper>
  );
}
