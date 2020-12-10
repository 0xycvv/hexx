import { useEventListener } from '../hooks';
import { usePlugin } from './plugin';
import { debounce } from '../utils/debounce';
import { ReactNode, useState } from 'react';
import { styled } from '@hexx/theme';
import { Rect } from '@popperjs/core';

const DropIndicator = styled('div', {
  width: '100%',
  height: 2,
  backgroundColor: '$highlight',
  position: 'absolute',
});

export function FileDropPlugin(props: {
  children?: () => JSX.Element;
}) {
  const { wrapperRef } = usePlugin();
  const [pos, setPos] = useState<Rect | null>(null);

  const dragOver = debounce(
    (e) => {
      console.log('dragover');
      const closestBlock =
        document
          .elementFromPoint(e.clientX, e.clientY)
          ?.closest('[data-block-id]') ||
        document.elementFromPoint(e.clientX, e.clientY);
      if (
        closestBlock instanceof HTMLElement &&
        closestBlock?.dataset?.blockId
      ) {
        const {
          x,
          y,
          width,
          height,
        } = closestBlock.getBoundingClientRect();
        setPos({ x, y, width, height });
      }
      e.preventDefault();
      e.stopPropagation();
    },
    50,
    true,
  );

  useEventListener('dragover', dragOver, wrapperRef);
  useEventListener(
    'dragstart',
    (e) => {
      console.log('dragstart');
      e.preventDefault();
      e.stopPropagation();
    },
    wrapperRef,
  );
  useEventListener(
    'drop',
    (e) => {
      console.log('drop');
      e.preventDefault();
      e.stopPropagation();
    },
    wrapperRef,
  );

  if (!pos) {
    return null;
  }

  if (typeof props.children === 'function') {
    return props.children();
  }

  return (
    <DropIndicator
      style={{
        top: pos?.y - pos?.height,
        left: pos?.x,
        right: pos?.width,
      }}
      className="drop-indicator"
    />
  );
}
