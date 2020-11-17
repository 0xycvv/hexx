function findClosetBlock() {
  return;
}

export function findBlockByIndex(i: number) {
  const el = document.querySelector(
    `[data-block-id]:nth-of-type(${i + 1})`,
  );
  if (el instanceof HTMLElement) {
    const editable = findContentEditable(el);
    const blockId = el.dataset?.blockId;
    return {
      el,
      editable,
      blockId,
    };
  }
  return null;
}

function findContentEditable(el: HTMLElement) {
  const editable = el.querySelector(
    '[contenteditable]',
  ) as HTMLDivElement;
  return editable;
}

export function findLastBlock() {
  const el = document.querySelectorAll(`[data-block-id]`)[
    document.querySelectorAll(`[data-block-id]`).length - 1
  ];
  if (el instanceof HTMLElement) {
    const editable = findContentEditable(el);
    const blockId = el.dataset?.blockId;
    return {
      el,
      blockId,
      editable,
    };
  }
  return null;
}

export function focusLastBlock() {
  const lastBlock = findLastBlock();
  if (lastBlock) {
    lastBlock.editable.focus();
  }
}

export function lastCursor() {
  document.execCommand('selectAll', false); // select all the content in the element
  document.getSelection()?.collapseToEnd(); // collapse selection to the end
}

export function focusWithCursor(el: Node, cursorIndex: number) {
  var range = document.createRange();
  var sel = window.getSelection();

  range.setStart(el, cursorIndex);
  range.collapse(true);

  sel.removeAllRanges();
  sel.addRange(range);
}

export function surround(commandName: string, showUI?: boolean, value?: string) {
  document.execCommand(commandName, showUI, value);
}
