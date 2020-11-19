export function removeRanges() {
  if (window.getSelection) {
    if (window.getSelection().empty) {
      // Chrome
      window.getSelection().empty();
    } else if (window.getSelection().removeAllRanges) {
      // Firefox
      window.getSelection().removeAllRanges();
    }
  }
}

export function saveSelection() {
  const selection = window.getSelection();
  return selection.rangeCount === 0 ? null : selection.getRangeAt(0);
}

export function restoreSelection(range?: Range) {
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
}
