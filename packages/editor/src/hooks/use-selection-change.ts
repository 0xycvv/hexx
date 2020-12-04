import { useEventListener } from './use-event-listener';

export function useSelectionChange(
  handler: (event: DocumentEventMap['selectionchange']) => void,
  ref?: HTMLElement | null,
) {
  useEventListener(
    'selectstart',
    () => {
      ref?.addEventListener('mouseup', handler);
    },
    ref,
  );

  return () => {
    if (handler) {
      ref?.removeEventListener('mouseup', handler);
    }
  };
}
