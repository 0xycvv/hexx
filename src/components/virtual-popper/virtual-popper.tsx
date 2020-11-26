import { ReactNode } from 'react';
import ClientOnlyPortal from '../client-only-portal';
import { useVirtualPopper } from './use-virtual-popper';

type Props = ReturnType<typeof useVirtualPopper>;

export function VirtualPopper({
  popper,
  ...props
}: {
  selector?: string;
  children: ReactNode;
  pointerEvent?: string;
  onClose?: () => void;
} & { popper: Props }) {
  if (!popper.active) {
    return null;
  }
  return (
    <ClientOnlyPortal selector={props.selector || 'body'}>
      <Overlay
        pointerEvent={props.pointerEvent}
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

function Overlay(props: {
  onClick?: (e: MouseEvent) => void;
  pointerEvent?: string;
}) {
  return (
    <>
      <style jsx>{`
        .elliot-popper-overlay {
          position: fixed;
          top: 0px;
          left: 0px;
          width: 100vw;
          height: 100vh;
          pointer-events: ${props.pointerEvent || 'none'};
        }
      `}</style>
      <div
        onMouseDown={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        onClick={props.onClick}
        className="elliot-popper-overlay"
      ></div>
    </>
  );
}
