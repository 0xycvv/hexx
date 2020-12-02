import * as React from 'react';
import { css, StitchesStyleObject } from '@hexx/theme';
import { BlockData } from './types';

interface EditorRendererProps {
  blocks: BlockData[];
  blockMap: {
    [x: string]: any;
  };
  maxWidth?: string;
}

const styles: StitchesStyleObject = {
  wrapper: {
    position: 'relative',
    WebkitBoxSizing: 'border-box',
    boxSizing: 'border-box',
    zIndex: 1,
    'div:first-of-type': {
      marginTop: 0,
    },
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 700,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 700,
    },
    h5: {
      fontSize: '1rem',
      fontWeight: 700,
    },
    h6: {
      fontSize: '0.875rem',
      fontWeight: 700,
    },
  },
  block: {
    position: 'relative',
    paddingTop: 16,
    paddingBottom: 16,
    padding: '.4em 0',
    margin: '0 auto',
    maxWidth: 650,
  },
} as const;

export function EditorRenderer({
  blocks,
  blockMap,
  maxWidth = '720px',
}: EditorRendererProps) {
  if (!Array.isArray(blocks)) {
    return null;
  }
  const content = React.Children.toArray(
    blocks.map((block) => {
      let Renderer = blockMap[block.type];
      if (!Renderer) {
        return null;
      }
      if (typeof block.data !== 'object') {
        return null;
      }
      const hasStretched =
        'stretched' in block.data && !!(block.data as any).stretched;
      return (
        <div
          style={{
            maxWidth: hasStretched ? 'none' : maxWidth,
          }}
          className={css(styles.block)}
        >
          <Renderer data={block.data} />
        </div>
      );
    }),
  );
  return <div className={css(styles.wrapper)}>{content}</div>;
}
