import { styled } from '@hexx/theme';
import * as React from 'react';
import { BlockData } from './types';

interface EditorRendererProps {
  blocks: BlockData[];
  scope: {
    [x: string]: any;
  };
  maxWidth?: string;
  wrapper?: React.ComponentProps<typeof Wrapper>;
  blockWrapper?: React.ComponentProps<typeof BlockWrapper>;
}

const Wrapper = styled('div', {
  position: 'relative',
  width: '100%',
  maxWidth: '100%',
  fontSize: 16,
  lineHeight: 1.5,
  zIndex: 1,
  color: 'rgb(55, 53, 47)',
});

const BlockWrapper = styled('div', {
  position: 'relative',
  margin: '0 auto',
  maxWidth: 650,
});

export function EditorRenderer({
  blocks,
  scope,
  maxWidth = '720px',
  blockWrapper,
  wrapper,
}: EditorRendererProps) {
  if (!Array.isArray(blocks)) {
    return null;
  }
  const content = React.Children.toArray(
    blocks.map((block) => {
      let Renderer = scope[block?.type];
      if (!Renderer) {
        return null;
      }
      const hasStretched =
        'stretched' in block.data && !!(block.data as any).stretched;

      return (
        <BlockWrapper
          style={{
            maxWidth: hasStretched ? 'none' : maxWidth,
          }}
          {...blockWrapper}
        >
          <Renderer data={block.data} />
        </BlockWrapper>
      );
    }),
  );
  return <Wrapper {...wrapper}>{content}</Wrapper>;
}
