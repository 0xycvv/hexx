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

// export function saveSelection() {
//   if (window.getSelection) {
//     let sel = window.getSelection();
//     if (sel.getRangeAt && sel.rangeCount) {
//       return sel.getRangeAt(0);
//     }
//   } else if (document.selection && document.selection.createRange) {
//     return document.selection.createRange();
//   }
//   return null;
// }

// export function restoreSelection(range) {
//   if (range) {
//     if (window.getSelection) {
//       let sel = window.getSelection();
//       sel.removeAllRanges();
//       sel.addRange(range);
//     } else if (document.selection && range.select) {
//       range.select();
//     }
//   }
// }
