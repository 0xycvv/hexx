import { EditableMap } from '../hooks/use-editor';
import { getSelectionRange } from './ranges';

function isBrowser() {
  return typeof window !== 'undefined';
}

function focusContentEditableWithOffset(
  currentEl: HTMLDivElement | HTMLElement | Element,
  offset: number,
) {
  if (!currentEl) {
    return;
  }
  // @ts-ignore
  const blockInfo = EditableMap.get(currentEl);
  if (blockInfo && blockInfo.blockIndex + offset >= 0) {
    if (blockInfo.index === 0) {
      const offsetBlock = findBlockByIndex(
        blockInfo.blockIndex + offset,
      );
      if (offsetBlock?.editable) {
        focusWithLastCursor(offsetBlock.editable, offset > 0);
      } else {
        focusContentEditableWithOffset(
          findPreviousContentEditable(blockInfo.blockIndex, offset),
          0,
        );
      }
    } else {
      const currentBlockDiv = findBlockById(blockInfo.id);
      const nodeList = currentBlockDiv.querySelectorAll(
        '[contenteditable]',
      );
      if (nodeList.length > 0 && nodeList[blockInfo.index + offset]) {
        focusWithLastCursor(
          nodeList[blockInfo.index + offset] as HTMLDivElement,
          offset > 0,
        );
      } else {
        focusContentEditableWithOffset(
          currentBlockDiv,
          offset + offset,
        );
      }
    }
  }
}

function findPreviousContentEditable(
  blockIndex: number,
  offset?: number,
) {
  const result = findBlockByIndex(blockIndex + offset);
  if (!result) {
    return;
  }
  if (result.editable) {
    return result.editable;
  } else {
    return findPreviousContentEditable(blockIndex + offset, offset);
  }
}

export function focusContentEditable(
  query: 'up' | 'down' | 'current',
) {
  const isActiveElementEditable =
    document.activeElement.getAttribute('contenteditable') === 'true';
  switch (query) {
    case 'current':
      if (isActiveElementEditable) {
        focusWithLastCursor(document.activeElement as HTMLDivElement);
      } else {
        focusWithLastCursor(
          document.activeElement.closest('[contenteditable]'),
        );
      }
      break;
    case 'up':
      focusContentEditableWithOffset(document.activeElement, -1);
      break;
    case 'down':
      focusContentEditableWithOffset(document.activeElement, 1);
      break;
    default:
      break;
  }
}

function findBlockById(id: string) {
  const el = document.querySelector(`[data-block-id="${id}"]`);
  return el;
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
    const editable = el.querySelector('[contenteditable]');
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

function focusWithLastCursor(
  el: HTMLElement,
  shouldFocusLast: boolean = true,
) {
  el?.focus();
  if (shouldFocusLast) {
    requestAnimationFrame(() => {
      lastCursor();
    });
  }
}

export function lastCursor() {
  if (isBrowser()) {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) {
      return;
    }
    document.execCommand('selectAll', false);
    document.getSelection()?.collapseToEnd();
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

export function surround(nodeName: string) {
  let range = getSelectionRange();
  let newNode = document.createElement(nodeName);
  if (!range) {
    return;
  }
  try {
    console.log(newNode);
    range.surroundContents(newNode);
    document.execCommand('formatBlock', false, 'p');
  } catch (e) {
    console.log(e);
  }
}
