export function generateGetBoundingClientRect(
  x = -10000,
  y = -10000,
) {
  return () => ({
    width: 0,
    height: 0,
    top: y,
    right: x,
    bottom: y,
    left: x,
  });
}

export function getRectFromTextNode() {
  const selection = window.getSelection();
  if (!selection || !selection.rangeCount) {
    return;
  }
  let selectedRange = window.getSelection().getRangeAt(0);
  console.log(selectedRange);
  if (
    Math.abs(selectedRange.startOffset - selectedRange.endOffset) > 0
  ) {
    const rect = selectedRange.getBoundingClientRect();
    return rect;
  }
}
