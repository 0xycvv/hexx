import { getSelectionRange } from './ranges';

function isBrowser() {
  return typeof window !== 'undefined';
}

function focusWithCaretIndex(
  el: HTMLDivElement,
  direction: 'up' | 'down',
  caretIndex: number,
) {
  const range = document.createRange();
  const sel = window.getSelection();
  const treeWalker = document.createTreeWalker(
    el,
    NodeFilter.SHOW_TEXT,
  );

  try {
    if (direction === 'down') {
      const nextTextNode = treeWalker.nextNode();
      let textLength = nextTextNode?.textContent?.length ?? 0;
      if (nextTextNode) {
        range.setStart(
          nextTextNode,
          textLength >= caretIndex ? caretIndex : textLength,
        );
        el.scrollIntoView({ block: 'end' });
      }
    } else {
      const nextTextNode = treeWalker.nextNode();
      let textLength = nextTextNode?.textContent?.length ?? 0;
      if (nextTextNode) {
        range.setStart(
          nextTextNode,
          textLength >= caretIndex ? caretIndex : textLength,
        );
        el.scrollIntoView({ block: 'start' });
      }
    }
    range.collapse(true);

    sel?.removeAllRanges();
    sel?.addRange(range);
  } catch (error) {}
}

function focusContentEditableWithOffset(
  currentActiveEl: HTMLDivElement | HTMLElement | Element | null,
  direction: 'up' | 'down',
  caretOffset: number,
) {
  if (!currentActiveEl) {
    return;
  }
  if (direction === 'down') {
    if (!currentActiveEl.nextElementSibling) return;
    const nextEditable =
      currentActiveEl.nextElementSibling.querySelector(
        '[contenteditable]',
      ) as HTMLDivElement;

    if (!nextEditable) {
      focusContentEditableWithOffset(
        currentActiveEl.nextElementSibling,
        direction,
        caretOffset,
      );
    } else {
      focusWithCaretIndex(nextEditable, direction, caretOffset);
    }
  }
  if (direction === 'up') {
    if (!currentActiveEl.previousElementSibling) return;
    const prevEditable =
      currentActiveEl.previousElementSibling?.querySelector(
        '[contenteditable]',
      ) as HTMLDivElement;
    if (!prevEditable) {
      focusContentEditableWithOffset(
        currentActiveEl.previousElementSibling,
        direction,
        caretOffset,
      );
    } else {
      focusWithCaretIndex(prevEditable, direction, caretOffset);
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
  caretOffset: number,
) {
  const isActiveElementEditable =
    document.activeElement?.getAttribute('contenteditable') ===
    'true';
  let activeBlockElement;

  if (isActiveElementEditable) {
    activeBlockElement = document.activeElement?.closest(
      '.hexx-block-wrapper',
    );
  }
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
      if (activeBlockElement) {
        focusContentEditableWithOffset(
          activeBlockElement,
          'up',
          caretOffset,
        );
      }
      break;
    case 'down':
      if (activeBlockElement) {
        focusContentEditableWithOffset(
          activeBlockElement,
          'down',
          caretOffset,
        );
      }
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

export function findInputs(el?: HTMLElement) {
  if (!el) {
    return;
  }
  const nodeList = el.querySelectorAll('[contenteditable]');
  const inputs = el.querySelectorAll('input');
  const textarea = el.querySelectorAll('textarea');
  return [
    ...Array.from(nodeList),
    ...Array.from(inputs),
    ...Array.from(textarea),
  ];
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
  if (isBrowser()) {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) {
      return;
    }
    document.execCommand('selectAll', false);
    document.getSelection()?.collapseToEnd();
  }
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
