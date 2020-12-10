import { useEventListener } from '../hooks';
import { usePlugin } from './plugin';

export function SelectionChangePlugin({
  onSelectionChange,
}: {
  onSelectionChange?: (range: Range) => void;
}) {
  const { wrapperRef } = usePlugin();

  useEventListener('selectionchange', (e) => {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) {
      return;
    }
    let selectedRange = selection.getRangeAt(0);
    if (
      selectedRange.commonAncestorContainer &&
      wrapperRef?.contains(selectedRange.commonAncestorContainer)
    ) {
      if (
        Math.abs(
          selectedRange.startOffset - selectedRange.endOffset,
        ) > 0
      ) {
        onSelectionChange?.(selectedRange);
      }
    }
  });

  return null;
}
