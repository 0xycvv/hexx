import { Rect } from '@popperjs/core';

export function generateGetBoundingClientRect(
  rect: Rect = { x: -10000, y: -10000, width: 0, height: 0 },
) {
  return () => ({
    width: rect.width,
    height: rect.height,
    top: rect.y,
    right: rect.x,
    bottom: rect.y,
    left: rect.x,
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
