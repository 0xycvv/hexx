import { Editor, EditorProps } from 'src/index';
import { useReactPopper } from 'src/components/virtual-popper/use-virtual-popper';
import { useEventListener } from 'src/hooks/use-event-listener';
import { generateGetBoundingClientRect } from 'src/utils/virtual-element';
import { PortalPopper } from 'src/components/virtual-popper/virtual-popper';
import { InlineToolBar } from 'src/components/inline-toolbar';
import { BlockMap } from 'src/components/default-block-map';

const EditorUsage = (props: EditorProps) => {
  const popper = useReactPopper({
    placement: 'top',
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
    <Editor {...props} blockMap={BlockMap}>
      <PortalPopper popper={popper}>
        <InlineToolBar />
      </PortalPopper>
    </Editor>
  );
};

export default EditorUsage;
