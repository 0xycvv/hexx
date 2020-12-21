import { BasicImageBlock } from '@hexx/block-basic-image';
import { CodeBlock } from '@hexx/block-code';
import { Editor, EditorProps } from '@hexx/editor';
import {
  BlockMap,
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
  LocalStoragePlugin,
  SelectionPlugin,
  LinkifyItPlugin,
  Unstable_MarkdownShortcutPlugin,
} from '@hexx/editor/plugins';
import { css } from '@hexx/theme';
import { ElementRef, useCallback, useRef } from 'react';
import tlds from 'tlds';
import Linkify from 'linkify-it';

const linkify = Linkify();

linkify.tlds(tlds);

const blockMap = {
  ...BlockMap,
  code: CodeBlock,
  'basic-image': BasicImageBlock,
};

const EditorExample = (props: EditorProps) => {
  const editorRef = useRef<ElementRef<typeof Editor>>();
  const localSaverRef = useRef<
    ElementRef<typeof LocalStoragePlugin>
  >();

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
        })}
        onClick={() => {
          // localSaverRef.current.save();
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
        <HistoryPlugin />
        <EditorWidthPlugin />
        <SelectionPlugin />
        <HexxDevTool />
        <Unstable_MarkdownShortcutPlugin />
        {/* <FileDropPlugin /> */}
        <LinkifyItPlugin linkifyIt={linkify} />
        <InlineTool>
          <InlineMarker />
          <InlineCode />
          <InlineLink />
        </InlineTool>
        <LocalStoragePlugin ref={localSaverRef} />
        <ChangeDetectPlugin
          onChange={() => {
            console.log('change');
          }}
        />
      </Editor>
    </>
  );
};

export default EditorExample;
