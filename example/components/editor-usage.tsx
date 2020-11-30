import {
  Editor,
  EditorProps,
  generateGetBoundingClientRect,
  useEventListener,
} from '@elliot/editor';
import {
  BlockMap,
  InlineToolBar,
  PortalPopper,
  useReactPopper,
} from '@elliot/editor/components';
import { PlusButton } from './plus-button';
import { TuneButton } from './tune-button';

const EditorUsage = (props: EditorProps) => {
  const popper = useReactPopper({
    placement: 'bottom-start',
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [0, 8],
        },
      },
    ],
  });

  useEventListener('selectionchange', (e) => {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) {
      return;
    }
    let selectedRange = selection.getRangeAt(0);
    if (
      Math.abs(selectedRange.startOffset - selectedRange.endOffset) >
      0
    ) {
      const rect = selectedRange.getBoundingClientRect();
      if (rect) {
        if (!popper.active) {
          popper.setActive(true);
        }
        popper.setReferenceElement({
          getBoundingClientRect: generateGetBoundingClientRect(rect),
        });
      }
    }
  });

  return (
    <Editor
      plusButton={<PlusButton />}
      dragButton={<TuneButton />}
      {...props}
      blockMap={BlockMap}
    >
      <PortalPopper popper={popper}>
        <InlineToolBar
          css={{
            borderRadius: '0px 26px 26px 26px',
          }}
        />
      </PortalPopper>
    </Editor>
  );
};

export default EditorUsage;
