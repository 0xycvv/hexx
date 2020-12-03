import {
  Editor,
  EditorProps,
  generateGetBoundingClientRect,
  useEventListener,
} from '@hexx/editor';
import {
  BlockMap,
  InlineToolBarPreset,
  PortalPopper,
  InlineCode,
  Unstable_InlineMarker,
  useReactPopper,
} from '@hexx/editor/components';
import { css } from '@hexx/theme';
import { ElementRef, useRef } from 'react';
import { PlusButton } from './plus-button';
import { TuneButton } from './tune-button';

const EditorUsage = (props: EditorProps) => {
  const editorRef = useRef<ElementRef<typeof Editor>>();

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
    <>
      <div
        className={css({
          position: 'fixed',
          right: 24,
          bottom: 24,
          cursor: 'pointer',
        })}
        onClick={() => {
          console.log(editorRef.current.getData());
        }}
      >
        <svg width={32} height={32} viewBox="0 0 24 24" fill="none">
          <path
            d="M12 1l9.5 5.5v11L12 23l-9.5-5.5v-11L12 1zm0 2.311L4.5 7.653v8.694l7.5 4.342 7.5-4.342V7.653L12 3.311zM12 16a4 4 0 110-8 4 4 0 010 8zm0-2a2 2 0 100-4 2 2 0 000 4z"
            fill="#000"
          />
        </svg>
      </div>
      <Editor
        ref={editorRef as any}
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
    </>
  );
};

export default EditorUsage;
