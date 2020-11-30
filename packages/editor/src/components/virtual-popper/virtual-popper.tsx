import { MouseEvent, ReactNode } from 'react';
import { styled } from '../../stitches.config';
import ClientOnlyPortal from '../client-only-portal';
import { useReactPopper } from './use-virtual-popper';
import type { Property } from 'csstype';

type Props = ReturnType<typeof useReactPopper>;

export function PortalPopper({
  popper,
  ...props
}: {
  selector?: string;
  children: ReactNode;
  pointerEvent?: Property.PointerEvents;
  onClose?: () => void;
} & { popper: Props }) {
  if (!popper.active) {
    return null;
  }
  return (
    <ClientOnlyPortal selector={props.selector || 'body'}>
      <Overlay
        className="elliot-popper-overlay"
        style={{
          pointerEvents: props.pointerEvent || 'none',
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        onClick={(e) => {
          props.onClose?.();
          popper.setActive(false);
          e.preventDefault();
          e.stopPropagation();
        }}
      />
      <div {...popper.getPopperProps()}>{props.children}</div>
    </ClientOnlyPortal>
  );
}

const Overlay = styled('div', {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
});
