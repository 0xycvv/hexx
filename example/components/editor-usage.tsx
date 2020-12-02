import {
  Editor,
  EditorProps,
  generateGetBoundingClientRect,
  useEventListener,
} from '@elliot/editor';
import {
  BlockMap,
  InlineToolBarPreset,
  PortalPopper,
  InlineCode,
  Unstable_InlineMarker,
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
      tuneButton={<TuneButton />}
      {...props}
      blockMap={BlockMap}
    >
      <PortalPopper popper={popper}>
        <InlineToolBarPreset
          css={{
            borderRadius: '0px 26px 26px 26px',
          }}
        >
          <Unstable_InlineMarker />
          <InlineCode />
        </InlineToolBarPreset>
      </PortalPopper>
    </Editor>
  );
};

export default EditorUsage;
