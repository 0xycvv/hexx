import { global } from '@hexx/theme';
import { useAtom } from 'jotai';
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';
import { blockSelectAtom, uiStateAtom } from '../../constants/atom';
import type SelectionJsType from './selection.d';

const globalStyles = global({
  '.selection': {
    background: 'rgba(46, 115, 252, 0.11)',
    borderRadius: '0.1em',
    border: '2px solid rgba(98, 155, 255, 0.81)',
  },
  '.selection-2': {
    background: 'transparent',
  },
});

interface SelectionPluginProps {
  enableInputCrossSelection?: boolean;
  classNameFilter?: string[];
}

export const SelectionPlugin = forwardRef<any, SelectionPluginProps>(
  (props, ref) => {
    const [blockSelect, setBlockSelect] = useAtom(blockSelectAtom);
    const [uiState, setUIState] = useAtom(uiStateAtom);
    const selectionRef = useRef<SelectionJsType>();
    const inputSelectionRef = useRef<SelectionJsType>();

    useEffect(() => {
      import('./selection.js').then((s) => {
        const SelectionJs = s.default;
        selectionRef.current = new SelectionJs({
          class: 'selection',
          // px, how many pixels the point should move before starting the selection (combined distance).
          // Or specifiy the threshold for each axis by passing an object like {x: <number>, y: <number>}.
          startThreshold: 50,
          allowTouch: false,
          singleTap: {
            allow: false,
            intersect: 'native',
          },
          intersect: 'touch',

          selectables: ['.hexx-block-wrapper'],
          startareas: ['.hexx'],
          boundaries: ['html'],
        })
          .on('beforestart', (evt) => {
            if (uiState.isDragging || uiState.isSorting) return false;
            if (evt?.event?.target instanceof HTMLElement) {
              if (
                evt.event.target.classList.contains(
                  'hexx-block-overlay',
                )
              ) {
                return false;
              }
              const isEditable =
                evt.event.target.getAttribute('contenteditable') ===
                  'true' ||
                evt.event.target.getAttribute('contenteditable') ===
                  'plaintext-only' ||
                evt.event.target.tagName === 'TEXTAREA' ||
                !!evt.event.target.closest('[contenteditable]');

              if (!isEditable) {
                return true;
              }
              return false;
            } else if (
              // @ts-ignore
              oe.target.parentElement instanceof HTMLElement
            ) {
              const isEditable =
                // @ts-ignore
                oe.target.parentElement.getAttribute(
                  'contenteditable',
                ) === 'true';
              return !isEditable;
            }
            // @ts-ignore
            return oe.target.tagName !== 'INPUT';
          })
          .on('move', ({ store }) => {
            const selectedBlockId = store.selected.map(
              (s) =>
                // @ts-ignore
                s.dataset.blockId,
            );
            setBlockSelect(new Set(selectedBlockId));
          })
          .on('start', () => {
            setUIState((s) => ({ ...s, isDragging: true }));
          })
          .on('stop', ({ event }) => {
            requestAnimationFrame(() => {
              setUIState((s) => ({ ...s, isDragging: false }));
            });
            event?.stopPropagation();
            event?.preventDefault();
          });
      });
      return () => {
        selectionRef.current?.destroy();
      };
    }, []);

    useEffect(() => {
      if (!props.enableInputCrossSelection) {
        return;
      }
      import('./selection.js').then((s) => {
        const SelectionJs = s.default;
        inputSelectionRef.current = new SelectionJs({
          class: 'selection-2',
          startThreshold: 200,
          intersect: 'touch',
          singleTap: {
            allow: false,
            intersect: 'native',
          },
          allowTouch: false,
          selectables: ['.hexx-block-wrapper'],
          startareas: ['.hexx-block-wrapper'],
          boundaries: ['html'],
        })
          .on('beforestart', ({ event }) => {
            if (uiState.isDragging || uiState.isSorting) {
              setBlockSelect(new Set());
              return false;
            }
            if (event?.target instanceof HTMLDivElement) {
              if (
                event.target.classList.contains('hexx-block-overlay')
              ) {
                setBlockSelect(new Set());
                return false;
              }
              const isEditable =
                event.target.getAttribute('contenteditable') ===
                  'true' ||
                event.target.getAttribute('contenteditable') ===
                  'plaintext-only' ||
                event.target.tagName === 'TEXTAREA' ||
                !!event.target.closest('[contenteditable]');

              if (isEditable) {
                setBlockSelect(new Set());
                return true;
              }
              setBlockSelect(new Set());
              return false;
            }
            setBlockSelect(new Set());
            return false;
          })
          .on('move', ({ store }) => {
            const selectedBlockId = store.selected.map(
              (s) =>
                // @ts-ignore
                s.dataset.blockId,
            );
            setBlockSelect(new Set(selectedBlockId));
          })
          .on('start', () => {
            setUIState((s) => ({ ...s, isDragging: true }));
          })
          .on('stop', ({}) => {
            requestAnimationFrame(() => {
              setUIState((s) => ({ ...s, isDragging: false }));
            });
          });
      });

      return () => {
        inputSelectionRef.current?.destroy();
      };
    }, [props.enableInputCrossSelection]);

    useEffect(() => {
      if (blockSelect.size === 0) {
        const selectionHTML = selectionRef.current?.getSelection();
        if (selectionHTML && selectionHTML.length > 0) {
          selectionRef.current?.clearSelection();
        }
        const inputSelection =
          inputSelectionRef.current?.getSelection();
        if (inputSelection && inputSelection.length > 0) {
          inputSelectionRef.current?.clearSelection();
        }
      }
    }, [blockSelect]);

    useImperativeHandle(ref, () => ({
      selection: () => selectionRef.current,
    }));

    globalStyles();

    return null;
  },
);
