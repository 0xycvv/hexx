import { useEffect, useState, ElementRef } from 'react';
import { BlockType, Editor } from '@hexx/editor';
import { css } from '@hexx/theme';
import { CodeBlockRenderer } from '@hexx/block-code';

export function DataViewer(props: {
  editor: ElementRef<typeof Editor>;
  onClose?: () => void;
}) {
  const [data, setData] = useState<BlockType<any>[]>();

  useEffect(() => {
    props.editor.getData().then(setData);
    console.log('get data');
  }, [props.editor]);

  useEffect(() => {
    const body = document.querySelector('body');
    body.style.overflow = 'hidden';

    return () => {
      body.style.overflow = 'unset';
    };
  }, []);

  if (!data) {
    return null;
  }

  return (
    <div
      className={css({
        position: 'fixed',
        top: 0,
        bottom: 0,
        right: 0,
        left: 0,
        background: 'white',
        overflow: 'scroll',
        zIndex: 999,
      })()}
    >
      <div
        className={css({
          position: 'absolute',
          top: '24px',
          right: '24px',
          cursor: 'pointer',
        })()}
        onClick={props.onClose}
      >
        Close
      </div>
      <CodeBlockRenderer
        data={{ value: JSON.stringify(data, null, 2), lang: 'json' }}
      />
    </div>
  );
}
