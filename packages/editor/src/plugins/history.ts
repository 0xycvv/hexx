import { history, redo, undo, undoHistory } from '../constants/atom';
import { useEventListener } from '../hooks';
import { usePlugin } from './plugin';

export function HistoryPlugin() {
  const { wrapperRef } = usePlugin();

  useEventListener(
    'keydown',
    (e) => {
      const buttonKey = /(Mac)/i.test(navigator.platform)
        ? 'metaKey'
        : 'ctrlKey';
      if (e[buttonKey] && e.key === 'z' && !e.shiftKey) {
        if (history.length > 0) {
          undo();
          e.preventDefault();
        }
      }
    },
    wrapperRef,
  );

  useEventListener(
    'keydown',
    (e) => {
      const buttonKey = /(Mac)/i.test(navigator.platform)
        ? 'metaKey'
        : 'ctrlKey';
      if (e[buttonKey] && e.shiftKey && e.key === 'z') {
        if (undoHistory.length > 0) {
          redo();
          e.preventDefault();
        }
      }
    },
    wrapperRef,
  );
  return null;
}
