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

export function getSelectionRange() {
  const selection = window.getSelection();
  if (!selection || !selection.rangeCount) {
    return;
  }
  return selection.getRangeAt(0);
}

export function extractFragmentFromPosition() {
  const selectRange = getSelectionRange();
  selectRange.deleteContents();
  const range = selectRange.cloneRange();
  range.selectNodeContents(document.activeElement);
  range.setStart(selectRange.endContainer, selectRange.endOffset);

  let next = range.extractContents();

  const wrapper = document.createElement('div');
  wrapper.append(next);
  return {
    next: wrapper.innerHTML,
    // @ts-ignore
    current: range.commonAncestorContainer.innerHTML,
  };
}
