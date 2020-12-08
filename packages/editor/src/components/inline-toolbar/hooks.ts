import { useCallback, useState } from 'react';
import { getSelectionRange } from '../../utils/ranges';
import { useEventListener } from '../../hooks/use-event-listener';
import { useLatestRef } from '../../hooks/use-latest-ref';
import { usePlugin } from '../../plugins';
import { commandKey } from '../../constants/key';

export interface UseInlineToolConfig {
  type?: string;
  shortcut?: string;
  onToggle: (active: boolean) => void;
}

const getShortcutArray = (shortcut: string) =>
  shortcut.split('+').map((s) => s.trim());

const COMMAND_SYMBOL = '⌘';

const commandCombo = (shortcut?: string) => {
  if (!shortcut) {
    return [false, null] as const;
  }
  const shortcuts = getShortcutArray(shortcut);
  const hasCommand = shortcuts.includes(COMMAND_SYMBOL);

  return [
    hasCommand,
    shortcuts.filter((s) => s !== COMMAND_SYMBOL)[0],
  ] as const;
};

export function useInlineTool({
  shortcut,
  onToggle,
}: {
  shortcut?: string;
  onToggle: (active: boolean) => void;
}) {
  const [isActive, setIsActive] = useState(false);
  const onMouseDown = useCallback((e) => {
    e.preventDefault();
  }, []);
  const { wrapperRef } = usePlugin();
  const [isCommandCombo, key] = commandCombo(shortcut);

  useEventListener(
    'keydown',
    (e) => {
      if (isCommandCombo && key && e[commandKey] && e.key === key) {
        onToggle(isActive);
      }
    },
    wrapperRef,
  );

  return {
    isActive,
    setIsActive,
    getProps: {
      onMouseDown,
      onClick: (e) => {
        onToggle(isActive);
      },
      color: isActive ? ('active' as const) : ('inactive' as const),
    },
  };
}

export function useDefaultInlineTool(props: UseInlineToolConfig) {
  const inlineTool = useInlineTool({
    shortcut: props.shortcut,
    onToggle: props.onToggle,
  });
  const handler = useCallback(() => {
    if (props.type) {
      const commandState = document.queryCommandState(props.type);
      inlineTool.setIsActive(commandState);
    }
  }, [props.type]);

  useEventListener('selectionchange', handler);

  useEventListener('mouseup', handler);

  useEventListener('dblclick', handler);

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
