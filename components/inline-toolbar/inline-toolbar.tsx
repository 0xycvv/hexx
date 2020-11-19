import Bold from '../../components/icons/bold';
import AlignLeft from '../../components/icons/align-left';
import AlignRight from '../../components/icons/align-right';
import AlignCenter from '../../components/icons/align-center';
import Italic from '../../components/icons/italic';
import Link from '../../components/icons/link';
import LinkOff from '../../components/icons/link-off';
import Underlined from '../../components/icons/underlined';
import { surround } from '../../utils/find-blocks';
import { useAtom } from 'jotai';
import { lastRangeAtom } from '../../constants/atom';
import { Children, ReactNode, useEffect, useState } from 'react';
import clsx from 'clsx';
import { useDefaultInlineTool, UseInlineToolConfig } from './hooks';
import { InlineLink } from './link/link';

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
  return <div {...getProps()}>{props.children}</div>;
}

export function InlineToolBar() {
  return (
    <div className="inline-toolbar">
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
      <style jsx>{`
        :global(.inline-toolbar) {
          display: grid;
          grid-auto-flow: column;
          grid-template-rows: repeat(auto-fill);
          gap: 16px;
          background: #242526;
          border-radius: 8px;
          padding: 0px 4px;
        }
        :global(.inline-toolbar .icon) {
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 24px;
          color: #f3f3f4;
          cursor: pointer;
          padding: 8px 4px;
          transition: all 100ms ease-out;
        }

        :global(.inline-toolbar .icon:hover) {
          background-color: #9b9fa4;
        }

        :global(.inline-toolbar .icon.active) {
          color: blue;
        }
      `}</style>
    </div>
  );
}
