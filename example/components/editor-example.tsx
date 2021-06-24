import { Editor, EditorProps } from '@hexx/editor';
import {
  InlineCode,
  InlineLink,
  InlineMarker,
  InlineTool,
  PlusButton,
  TuneButton,
} from '@hexx/editor/components';
import {
  ChangeDetectPlugin,
  EditorWidthPlugin,
  HexxDevTool,
  HistoryPlugin,
  LinkifyItPlugin,
  LocalStoragePlugin,
  SelectionPlugin,
  Unstable_FileDropPlugin,
  Unstable_MarkdownShortcutPlugin,
} from '@hexx/editor/plugins';
import { BasicImageBlock } from '@hexx/block-basic-image';
import { css } from '@hexx/theme';
import { blockMap } from 'lib/block-map';
import Linkify from 'linkify-it';
import { ElementRef, useCallback, useRef, useState } from 'react';
import tlds from 'tlds';
import { DataViewer } from './data-viewer';

const linkify = Linkify();

linkify.tlds(tlds);

const EditorExample = (props: Omit<EditorProps, 'blockMap'>) => {
  const [showDataViewer, setShowDataViewer] = useState(false);
  const editorRef = useRef<ElementRef<typeof Editor>>();
  const localSaverRef =
    useRef<ElementRef<typeof LocalStoragePlugin>>();

  const onLoadLocalStorage = useCallback(() => {
    requestAnimationFrame(() => {
      if (localSaverRef.current) {
        localSaverRef.current.load();
      }
    });
  }, [localSaverRef.current]);

  return (
    <>
      <div
        className={css({
          position: 'fixed',
          right: 24,
          bottom: 24,
          cursor: 'pointer',
          zIndex: 1,
        })()}
        onClick={() => {
          setShowDataViewer(true);
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
        onLoad={onLoadLocalStorage}
        blockCss={{
          marginTop: 8,
          marginBottom: 8,
          maxWidth: '720px',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
        css={{
          paddingLeft: '2rem',
          paddingRight: '3.75rem',
          maxWidth: '960px',
          margin: 'auto',
        }}
        {...props}
        blockMap={blockMap}
      >
        <PlusButton />
        <TuneButton />
        <EditorWidthPlugin />
        <HistoryPlugin />
        <SelectionPlugin enableInputCrossSelection />
        <HexxDevTool />
        <LinkifyItPlugin linkifyIt={linkify} />
        <InlineTool>
          <InlineMarker />
          <InlineCode />
          <InlineLink />
        </InlineTool>
        {/* <Unstable_MarkdownShortcutPlugin />
        <Unstable_FileDropPlugin
          resolve={async (files) => {
            if (files[0] && files[0].type.includes('image')) {
              return {
                type: BasicImageBlock.block.type,
                data: {
                  url: await BasicImageBlock.block.config.onInput(
                    files,
                  ),
                },
              };
            }
          }}
        />

         */}
        <LocalStoragePlugin ref={localSaverRef} />
        {/* <ChangeDetectPlugin
          onChange={() => {
            console.log('change');
          }}
        /> */}
      </Editor>
      {showDataViewer && (
        <DataViewer
          editor={editorRef.current}
          onClose={() => setShowDataViewer(false)}
        />
      )}
    </>
  );
};

export default EditorExample;
