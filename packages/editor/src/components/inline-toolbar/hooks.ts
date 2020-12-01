import { useCallback, useState } from 'react';
import { getSelectionRange } from '../../utils/ranges';
import { useEventListener } from '../../hooks/use-event-listener';
import { useLatestRef } from '../../hooks/use-latest-ref';

export interface UseInlineToolConfig {
  type: string;
  onClick?: () => void;
}

export function useInlineTool(props?: UseInlineToolConfig) {
  const [isActive, setIsActive] = useState(false);
  const onClick = useCallback(() => {
    props?.onClick?.();
  }, []);

  const onMouseDown = useCallback((e) => {
    e.preventDefault();
  }, []);

  const bindProps = {
    onClick,
    onMouseDown,
    color: isActive ? 'active' : 'inactive',
  } as const;
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
  cb?: (value: [isLink: boolean, url: string | null]) => void,
) {
  const savedRef = useLatestRef(cb);

  useEventListener('selectionchange', () => {
    savedRef.current?.(isLink());
  });
  useEventListener('dblclick', () => {
    savedRef.current?.(isLink());
  });
}

const isLink = (): [boolean, string | null] => {
  const range = getSelectionRange();
  if (range) {
    if (
      // @ts-ignore
      range.startContainer?.parentNode instanceof HTMLAnchorElement ||
      // @ts-ignore
      range.endContainer?.parentNode instanceof HTMLAnchorElement
    ) {
      const url =
        (range.startContainer?.parentNode as HTMLAnchorElement)
          .href ||
        (range.endContainer?.parentNode as HTMLAnchorElement).href;
      return [true, url];
    } else {
      return [false, null];
    }
  } else {
    return [false, null];
  }
};
