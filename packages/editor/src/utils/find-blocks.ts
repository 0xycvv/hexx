import { EditableWeakMap } from '../hooks/use-editor';
import { getSelectionRange } from './ranges';

function isBrowser() {
  return typeof window !== 'undefined';
}

function focusContentEditableWithOffset(
  currentActiveEl?: HTMLDivElement | HTMLElement | Element | null,
  offset: number = 0,
) {
  if (!currentActiveEl) {
    return;
  }
  const editableWeakData = EditableWeakMap.get(currentActiveEl);
  if (editableWeakData && editableWeakData.blockIndex + offset >= 0) {
    // first contenteditable
    if (editableWeakData.index === 0) {
      // find next contenteditable if existed
      const offsetBlock = findBlockByIndex(
        editableWeakData.blockIndex + offset,
      );
      if (offsetBlock?.editable) {
        focusWithLastCursor(offsetBlock.editable, offset <= 0);
      } else {
        focusContentEditableWithOffset(
          findPreviousContentEditable(
            editableWeakData.blockIndex,
            offset,
          ),
          0,
        );
      }
    } else {
      const currentBlockDiv = findBlockById(editableWeakData.id)?.el;
      const nodeList = currentBlockDiv?.querySelectorAll(
        '[contenteditable]',
      );
      if (
        nodeList &&
        nodeList?.length > 0 &&
        nodeList?.[editableWeakData.index + offset]
      ) {
        focusWithLastCursor(
          nodeList[editableWeakData.index + offset] as HTMLDivElement,
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
  offset: number = 0,
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
    document.activeElement?.getAttribute('contenteditable') ===
    'true';
  switch (query) {
    case 'current':
      if (isActiveElementEditable) {
        focusWithLastCursor(document.activeElement as HTMLDivElement);
      } else {
        const closetContentEditable = document.activeElement?.closest(
          '[contenteditable]',
        );
        if (closetContentEditable) {
          focusWithLastCursor(closetContentEditable);
        }
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

export function findBlockById(id: string, first?: boolean) {
  const el = document.querySelector(`[data-block-id="${id}"]`);
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
  const el =
    document.querySelectorAll(`[data-block-id]`)[
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

export function focusLastBlock(shouldFocusLast = false) {
  const lastBlock = findLastBlock();
  if (lastBlock) {
    lastBlock.editable?.focus();
    if (shouldFocusLast) {
      requestAnimationFrame(() => {
        lastCursor();
      });
    }
  }
}

export function focusWithLastCursor(
  el: HTMLElement | Element,
  shouldFocusLast: boolean = true,
) {
  if (el instanceof HTMLElement) {
    el?.focus();

    if (shouldFocusLast) {
      requestAnimationFrame(() => {
        lastCursor();
      });
    }
  }
}

export function lastCursor() {
  // if (isBrowser()) {
  //   const selection = window.getSelection();
  //   if (!selection || !selection.rangeCount) {
  //     return;
  //   }
  //   document.execCommand('selectAll', false);
  //   document.getSelection()?.collapseToEnd();
  // }
}

export function surround(
  nodeName: string,
  style?: Partial<CSSStyleDeclaration>,
) {
  let range = getSelectionRange();
  let newNode = document.createElement(nodeName);
  if (style) {
    Object.assign(newNode.style, style);
  }
  if (!range) {
    return;
  }
  try {
    range.surroundContents(newNode);
  } catch (e) {
    console.log(e);
  }
}

export function createRangeLink(range: Range, url: string) {
  const aLink = document.createElement('a');
  aLink.href = url;
  aLink.target = '_blank';
  aLink.rel = 'noopener nofollow';
  range.surroundContents(aLink);
}
