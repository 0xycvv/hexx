import { css } from '@hexx/theme';
import { atom, useAtom } from 'jotai';
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';
import {
  blockSelectAtom,
  uiStateAtom,
  _hexxScope,
} from '../../constants/atom';
import SelectionJs from './selection';

const blockIdSelectionAtom = atom<string[]>([]);

blockIdSelectionAtom.scope = _hexxScope;

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

interface SelectionPluginProps {
  enableInputCrossSelection?: boolean;
}

export const SelectionPlugin = forwardRef<any, SelectionPluginProps>(
  (props, ref) => {
    const [blockSelect, setBlockSelect] = useAtom(blockSelectAtom);
    const [uiState, setUIState] = useAtom(uiStateAtom);
    const selectionRef = useRef<SelectionJs>();
    const inputSelectionRef = useRef<SelectionJs>();

    useEffect(() => {
      selectionRef.current = new SelectionJs({
        class: 'selection',
        // px, how many pixels the point should move before starting the selection (combined distance).
        // Or specifiy the threshold for each axis by passing an object like {x: <number>, y: <number>}.
        startThreshold: 50,

        // Disable the selection functionality for touch devices
        disableTouch: false,
        singleClick: false,

        // On which point an element should be selected.
        // Available modes are cover (cover the entire element), center (touch the center) or
        // the default mode is touch (just touching it).
        mode: 'touch',

        // Behaviour on single-click
        // Available modes are 'native' (element was mouse-event target) or
        // 'touch' (element got touched)
        tapMode: 'native',

        // Query selectors from elements which can be selected
        selectables: ['.hexx-block-wrapper'],

        // Query selectors for elements from where a selection can be start
        startareas: ['.hexx'],

        // Query selectors for elements which will be used as boundaries for the selection
        boundaries: ['html'],

        // Query selector or dom node to set up container for selection-area-element
        selectionAreaContainer: 'body',

        // On scrollable areas the number on px per frame is devided by this amount.
        // Default is 10 to provide a enjoyable scroll experience.
        scrollSpeedDivider: 10,

        // Browsers handle mouse-wheel events differently, this number will be used as
        // numerator to calculate the mount of px while scrolling manually: manualScrollSpeed / scrollSpeedDivider
        manualScrollSpeed: 750,
      })
        .on('beforestart', ({ oe }) => {
          if (uiState.isDragging) return false;
          if (oe.target instanceof HTMLDivElement) {
            if (oe.target.classList.contains('hexx-block-overlay')) {
              return false;
            }
            const isEditable =
              oe.target.getAttribute('contenteditable') === 'true';
            if (!isEditable) {
              return true;
            }
            return false;
            // @ts-ignore
          } else if (oe.target.parentElement instanceof HTMLElement) {
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
        .on('move', ({ selected }) => {
          const selectedBlockId = selected.map(
            (s) =>
              // @ts-ignore
              s.dataset.blockId,
          );
          setBlockSelect(selectedBlockId);
        })
        .on('start', () => {
          setUIState((s) => ({ ...s, isDragging: true }));
        })
        .on('stop', ({ inst }) => {
          // Remember selection in case the user wants to add smth in the next one
          inst.keepSelection();
          requestAnimationFrame(() => {
            setUIState((s) => ({ ...s, isDragging: false }));
          });
        });
    }, []);

    useEffect(() => {
      if (!props.enableInputCrossSelection) {
        return;
      }
      inputSelectionRef.current = new SelectionJs({
        class: 'selection-2',
        singleClick: false,
        // px, how many pixels the point should move before starting the selection (combined distance).
        // Or specifiy the threshold for each axis by passing an object like {x: <number>, y: <number>}.
        startThreshold: 100,

        // Disable the selection functionality for touch devices
        disableTouch: false,

        // On which point an element should be selected.
        // Available modes are cover (cover the entire element), center (touch the center) or
        // the default mode is touch (just touching it).
        mode: 'touch',

        // Behaviour on single-click
        // Available modes are 'native' (element was mouse-event target) or
        // 'touch' (element got touched)
        tapMode: 'touch',

        // Query selectors from elements which can be selected
        selectables: ['.hexx-block-wrapper'],

        // Query selectors for elements from where a selection can be start
        startareas: ['.hexx-block-wrapper'],

        // Query selectors for elements which will be used as boundaries for the selection
        boundaries: ['html'],

        // Query selector or dom node to set up container for selection-area-element
        selectionAreaContainer: 'body',

        // On scrollable areas the number on px per frame is devided by this amount.
        // Default is 10 to provide a enjoyable scroll experience.
        scrollSpeedDivider: 10,

        // Browsers handle mouse-wheel events differently, this number will be used as
        // numerator to calculate the mount of px while scrolling manually: manualScrollSpeed / scrollSpeedDivider
        manualScrollSpeed: 750,
      })
        .on('beforestart', ({ oe }) => {
          if (uiState.isDragging) return false;
          if (oe.target instanceof HTMLDivElement) {
            if (oe.target.classList.contains('hexx-block-overlay')) {
              return false;
            }
            // const isEditable =
            //   oe.target.getAttribute('contenteditable') === 'true';
            // if (!isEditable) {
            //   return true;
            // }
            // return false;
          }
          return true;
        })
        .on('move', ({ selected }) => {
          const selectedBlockId = selected.map(
            (s) =>
              // @ts-ignore
              s.dataset.blockId,
          );
          setBlockSelect(selectedBlockId);
        })
        .on('start', () => {
          setUIState((s) => ({ ...s, isDragging: true }));
        })
        .on('stop', ({ inst }) => {
          // Remember selection in case the user wants to add smth in the next one
          inst.keepSelection();
          requestAnimationFrame(() => {
            setUIState((s) => ({ ...s, isDragging: false }));
          });
        });
    }, [props.enableInputCrossSelection]);

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

    useImperativeHandle(ref, () => ({
      selection: () => selectionRef.current,
    }));

    globalStyles();

    return null;
  },
);
