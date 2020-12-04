import { useCallback, useState } from 'react';
import { getSelectionRange } from '../../utils/ranges';
import { useEventListener } from '../../hooks/use-event-listener';
import { useLatestRef } from '../../hooks/use-latest-ref';

export interface UseInlineToolConfig {
  type?: string;
}

export function useInlineTool() {
  const [isActive, setIsActive] = useState(false);

  const onMouseDown = useCallback((e) => {
    e.preventDefault();
  }, []);

  return {
    isActive,
    setIsActive,
    getProps: {
      onMouseDown,
      color: isActive ? ('active' as const) : ('inactive' as const),
    },
  };
}

export function useDefaultInlineTool(props: UseInlineToolConfig) {
  const inlineTool = useInlineTool();
  useEventListener('selectionchange', () => {
    console.log('change');
    if (props.type) {
      const commandState = document.queryCommandState(props.type);
      inlineTool.setIsActive(commandState);
    }
  });

  useEventListener('select', () => {
    console.log('select');
  })

  useEventListener('selectstart', () => {
    console.log('selectstart');
  })

  useEventListener('dblclick', () => {
    console.log('click');
    if (props.type) {
      const commandState = document.queryCommandState(props.type);
      inlineTool.setIsActive(commandState);
    }
  });

  return inlineTool;
}

export function useEventChangeSelection(cb?: () => void) {
  const savedRef = useLatestRef(cb);

  useEventListener('selectionchange', () => {
    savedRef.current?.();
  });
  useEventListener('dblclick', () => {
    savedRef.current?.();
  });
}

export const isAnchorElement = (): [boolean, string | null] => {
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
