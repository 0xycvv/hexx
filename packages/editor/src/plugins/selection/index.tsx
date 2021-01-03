import { css } from '@hexx/theme';
import DragSelect from 'dragselect';
import { atom, useAtom } from 'jotai';
import { useEffect, useRef } from 'react';
import {
  blockSelectAtom,
  uiStateAtom,
  _hexxScope,
} from '../../constants/atom';

const blockIdSelectionAtom = atom<string[]>([]);

blockIdSelectionAtom.scope = _hexxScope;

const isContentEditable = (element: HTMLElement) =>
  element.getAttribute('contenteditable') === 'true' ||
  element.getAttribute('contenteditable') === 'plaintext-only' ||
  element.tagName === 'TEXTAREA' ||
  element.parentElement?.getAttribute('contenteditable') === 'true';

const globalStyles = css.global({
  '.selection': {
    background: 'rgba(46, 115, 252, 0.11)',
    borderRadius: '0.1em',
    border: '2px solid rgba(98, 155, 255, 0.81)',
  },
  '.selection-2': {
    background: 'transparent',
  },
});

export const SelectionPlugin = () => {
  const [blockSelect, setBlockSelect] = useAtom(blockSelectAtom);
  const [uiState, setUIState] = useAtom(uiStateAtom);
  const selectionRef = useRef<any>();
  const inputSelectionRef = useRef<any>();

  useEffect(() => {
    const ds = new DragSelect({
      customStyles: true,
      selectables: document.getElementsByClassName(
        'hexx-block-wrapper',
      ),
      selectorClass: 'selection',
      onDragStart: () => {
        ds.addSelectables(
          document.getElementsByClassName('hexx-block-wrapper'),
        );
        setUIState((s) => ({ ...s, isDragging: true }));
      },
      onDragMove: (e: MouseEvent) => {
        e.preventDefault();
      },
      callback: () => {
        setUIState((s) => ({ ...s, isDragging: false }));
      },
      onElementUnselect: (node?: HTMLElement) => {
        if (node?.dataset.blockId) {
          setBlockSelect((s) =>
            s.filter((s) => s !== node.dataset.blockId),
          );
        }
      },
      onDragStartBegin: (e: MouseEvent) => {
        if (uiState.isDragging) {
          ds.break();
        }
        if (e.target instanceof HTMLElement) {
          if (e.target.classList.contains('hexx-block-overlay')) {
            ds.break();
          }
          const isEditable =
            e.target.getAttribute('contenteditable') === 'true' ||
            e.target.getAttribute('contenteditable') ===
              'plaintext-only' ||
            e.target.tagName === 'TEXTAREA' ||
            e.target.parentElement?.getAttribute(
              'contenteditable',
            ) === 'true';
          if (isEditable) {
            ds.break();
          }
        }
      },
      onElementSelect: (node?: HTMLElement) => {
        if (node?.dataset.blockId) {
          setBlockSelect((s) => [
            ...s,
            node.dataset.blockId as string,
          ]);
        }
      },
    });
    selectionRef.current = ds;
  }, []);

  useEffect(() => {
    const ds = new DragSelect({
      customStyles: true,
      selectables: document.getElementsByClassName(
        'hexx-block-wrapper',
      ),
      selectorClass: 'selection-2',
      onDragStartBegin: () => {
        if (uiState.isDragging) {
          ds.break();
        }
      },
      onDragStart: (e) => {
        if (!isContentEditable(e.target)) {
          ds.stop();
        } else {
          ds.start();
        }
        ds.addSelectables(
          document.getElementsByClassName('hexx-block-wrapper'),
        );
        setUIState((s) => ({ ...s, isDragging: true }));
      },
      callback: () => {
        setUIState((s) => ({ ...s, isDragging: false }));
      },
      onElementUnselect: (node?: HTMLElement) => {
        if (node?.dataset.blockId) {
          setBlockSelect((s) =>
            s.filter((s) => s !== node.dataset.blockId),
          );
        }
      },
      onElementSelect: (node?: HTMLElement) => {
        const { x, y } = ds.getCursorPositionDifference();
        if (Math.abs(y) < 50) {
          return;
        }
        const nodes = ds.getSelection();
        if (node?.dataset.blockId) {
          setBlockSelect((s) => [
            ...s,
            ...nodes?.map((n) => n.dataset.blockId as string),
          ]);
        }
      },
    });
    inputSelectionRef.current = ds;
  }, []);

  useEffect(() => {
    if (blockSelect.length === 0) {
      const selectionHTML = selectionRef.current?.getSelection();
      if (selectionHTML && selectionHTML.length > 0) {
        selectionRef.current?.clearSelection();
      }
      const inputSelection = inputSelectionRef.current?.getSelection();
      if (inputSelection && inputSelection.length > 0) {
        inputSelectionRef.current?.clearSelection();
      }
    }
  }, [blockSelect]);

  globalStyles();

  return null;
};
