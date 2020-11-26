import Bold from '../icons/bold';
import AlignLeft from '../icons/align-left';
import AlignRight from '../icons/align-right';
import AlignCenter from '../icons/align-center';
import Italic from '../icons/italic';
import Link from '../icons/link';
import LinkOff from '../icons/link-off';
import Underlined from '../icons/underlined';
import { surround } from '../../utils/find-blocks';
import { useAtom } from 'jotai';
import { lastRangeAtom } from '../../constants/atom';
import { Children, ReactNode, useEffect, useState } from 'react';
import clsx from 'clsx';
import { useDefaultInlineTool, UseInlineToolConfig } from './hooks';
import { InlineLink } from './link/link';
import { styled } from 'src/stitches.config';

const Wrapper = styled('div', {
  display: 'grid',
  gridAutoFlow: 'column',
  gridTemplateRows: 'repeat(auto-fill)',
  gap: 16,
  background: '#242526',
  borderRadius: 8,
  padding: '0px 4px',
});

export const IconWrapper = styled('div', {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontSize: 24,
  color: '#f3f3f4',
  cursor: 'pointer',
  padding: '8px 4px',
  ':hover': {
    backgroundColor: '#9b9fa4',
  },
  "&[data-active='true']": {
    backgroundColor: 'aqua',
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

export function InlineToolBar() {
  return (
    <Wrapper>
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
    </Wrapper>
  );
}
