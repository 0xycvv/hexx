import { useCallback, useState } from 'react';
import clsx from 'clsx';
import { useEventListener } from '../../hooks/use-event-listener';
import { useLatestRef } from '../../hooks/use-latest-ref';

export interface UseInlineToolConfig {
  type: string;
  onClick?: () => void;
}

export function useInlineTool(props?: UseInlineToolConfig) {
  const [isActive, setIsActive] = useState(false);
  const onClick = useCallback(() => {
    props.onClick?.();
  }, []);

  const onMouseDown = useCallback((e) => {
    e.preventDefault();
  }, []);

  const bindProps = {
    onClick,
    onMouseDown,
    className: clsx('icon', {
      active: isActive,
    }),
  };
  return {
    isActive,
    setIsActive,
    getProps: (p: Partial<typeof bindProps> = {}) => ({
      ...p,
      ...bindProps,
    }),
  };
}

export function useDefaultInlineTool(props?: UseInlineToolConfig) {
  const inlineTool = useInlineTool(props);
  useEventListener('selectionchange', () => {
    const commandState = document.queryCommandState(props.type);
    inlineTool.setIsActive(commandState);
  });
  useEventListener('dblclick', () => {
    const commandState = document.queryCommandState(props.type);
    inlineTool.setIsActive(commandState);
  });

  return inlineTool;
}

export function useEventChangeSelection(
  cb?: (value: boolean) => void,
) {
  const savedRef = useLatestRef(cb);

  useEventListener('selectionchange', () => {
    savedRef.current?.(isLink());
  });
  useEventListener('dblclick', () => {
    savedRef.current?.(isLink());
  });
}

const isLink = () => {
  const selection = window.getSelection().getRangeAt(0);
  if (selection) {
    console.log(selection);
    if (
      // @ts-ignore
      selection.startContainer.parentNode.tagName === 'A' ||
      // @ts-ignore
      selection.endContainer.parentNode.tagName === 'A'
    ) {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
};
