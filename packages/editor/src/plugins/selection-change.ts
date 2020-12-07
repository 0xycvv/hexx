import { useSelectionChange } from '../hooks/use-selection-change';
import { usePlugin } from './plugin';

export function SelectionChangePlugin({
  onSelectionChange,
}: {
  onSelectionChange?: (range: Range) => void;
}) {
  const { wrapperRef } = usePlugin();
  useSelectionChange((e) => {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) {
      return;
    }
    let selectedRange = selection.getRangeAt(0);
    if (
      Math.abs(selectedRange.startOffset - selectedRange.endOffset) >
      0
    ) {
      onSelectionChange?.(selectedRange);
    }
  }, wrapperRef);

  return null;
}
