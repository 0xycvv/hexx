function isBrowser() {
  return typeof window !== 'undefined';
}

function findClosetBlock() {
  return;
}

export function findBlockByIndex(i: number, first?: boolean) {
  const el = document.querySelector(
    `[data-block-id]:nth-of-type(${i + 1})`,
  );
  if (el instanceof HTMLElement) {
    const editable = findContentEditable(el, first);
    const blockId = el.dataset?.blockId;
    return {
      el,
      editable,
      blockId,
    };
  }
  return null;
}

export function focusBlockByIndex(i: number, first?: boolean) {
  findBlockByIndex(i, first)?.editable?.focus();
  requestAnimationFrame(() => {
    lastCursor();
  });
}

export function findContentEditable(
  el?: HTMLElement,
  first?: boolean,
) {
  if (!el) {
    return;
  }
  if (first) {
    const editable = el.querySelector('[contenteditable');
    return editable as HTMLDivElement;
  }
  const editableNodeList = el.querySelectorAll('[contenteditable]');
  const editable = editableNodeList[editableNodeList.length - 1];
  return editable as HTMLDivElement;
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
    lastBlock.editable?.focus();
  }
}

export function lastCursor() {
  if (isBrowser) {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) {
      return;
    }
    document.execCommand('selectAll', false); // select all the content in the element
    document.getSelection()?.collapseToEnd(); // collapse selection to the end
  }
}

export function focusWithCursor(el: Node, cursorIndex: number) {
  var range = document.createRange();
  var sel = window.getSelection();

  range.setStart(el, cursorIndex);
  range.collapse(true);

  sel.removeAllRanges();
  sel.addRange(range);
}

export function surround(
  commandName: string,
  selection?: Selection,
  value?: string,
) {
  document.execCommand(commandName, false, value);
}
