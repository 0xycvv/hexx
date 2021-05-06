import { MouseEvent, useCallback, useMemo, useState } from 'react';
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
  const shortcuts = useMemo(() => getShortcutArray(shortcut), [
    shortcut,
  ]);
  const shortcutKey = useMemo(
    () => shortcuts.filter((s) => s !== COMMAND_SYMBOL)[0],
    [shortcuts],
  );
  const hasCommand = useMemo(
    () => shortcuts.includes(COMMAND_SYMBOL),
    [shortcuts],
  );

  return [hasCommand, shortcutKey] as const;
};

export function useInlineTool({
  shortcut,
  onToggle,
}: {
  shortcut?: string;
  onToggle: (active: boolean) => void;
}) {
  const [isActive, setIsActive] = useState(false);
  const { wrapperRef } = usePlugin();
  const [isCommandCombo, key] = commandCombo(shortcut);

  useEventListener(
    'keydown',
    (e) => {
      if (isActive && e.key === 'Escape') {
        let range = getSelectionRange();
        if (range?.collapsed) {
          document.execCommand('insertText', false, ' ');
          range = getSelectionRange();
          requestAnimationFrame(() => {
            if (!range) return;
            range.setStart(
              range.startContainer,
              range.startOffset - 1,
            );
            range.setEnd(range.endContainer, range.endOffset);
            requestAnimationFrame(() => {
              onToggle(false);
              const sel = getSelection();
              sel?.collapseToEnd();
            });
          });
          e.preventDefault();
        }
      }
      if (isCommandCombo && key && e[commandKey] && e.key === key) {
        onToggle(!isActive);
        e.preventDefault();
        return;
      }
    },
    wrapperRef,
  );

  return {
    isActive,
    setIsActive,
    getProps: {
      onClick: (e?: MouseEvent) => {
        e?.preventDefault();
        e?.stopPropagation();
        onToggle(!isActive);
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
