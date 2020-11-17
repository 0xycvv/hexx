import Bold from '../../components/icons/bold';
import AlignLeft from '../../components/icons/align-left';
import AlignRight from '../../components/icons/align-right';
import AlignCenter from '../../components/icons/align-center';
import Italic from '../../components/icons/italic';
import Link from '../../components/icons/link';
import LinkOff from '../../components/icons/link-off';
import Underlined from '../../components/icons/underlined';
import styles from './inline-toolbar.module.css';
import { surround } from '../../utils/find-blocks';
import { useAtom } from 'jotai';
import { lastRangeAtom } from '../../constants/atom';
import { restoreSelection } from '../../utils/remove-ranges';
import { useEffect, useState } from 'react';
import clsx from 'clsx';

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
    icon: <Link />,
    onClick: () => {
      const selection = document.getSelection();
      surround('createLink', false, 'https://www.google.com');
      console.log({ a: selection.anchorNode.parentElement });
      selection.anchorNode.parentElement.setAttribute(
        'target',
        '_blank',
      );
      selection.anchorNode.parentElement.setAttribute(
        'rel',
        'noopener noreferrer',
      );
      selection.anchorNode.parentElement.setAttribute(
        'contenteditable',
        'false',
      );
    },
  },
];

function InlineTool(props) {
  const [isActive, setIsActive] = useState(false);

  return (
    <div
      onClick={(e) => {
        props.onClick?.();
        const yes = document.queryCommandState(props.type);
        setIsActive(yes);
      }}
      onMouseDown={(e) => {
        e.preventDefault();
      }}
      className={styles.icon}
      style={{ background: isActive ? 'red' : 'blue' }}
    >
      {props.children}
    </div>
  );
}

export function InlineToolBar() {
  return (
    <div className={styles.wrapper}>
      {inlineTools.map((tool) => (
        <InlineTool
          type={tool.type}
          onClick={tool.onClick}
          key={tool.type}
        >
          {tool.icon}
        </InlineTool>
      ))}
    </div>
  );
}
