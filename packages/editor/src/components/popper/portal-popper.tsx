import { Property } from 'csstype';
import { ReactNode, useEffect } from 'react';
import { styled } from '@hexx/theme';
import ClientOnlyPortal from '../client-only-portal';
import { useReactPopper } from './use-react-popper';

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
  useEffect(() => {
    return () => {
      props.onClose?.();
    };
  }, []);

  return (
    <ClientOnlyPortal selector={props.selector || 'body'}>
      {popper.active && <Overlay
        className="hexx-popper-overlay"
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
      />}
      <PopperLayer {...popper.getPopperProps()}>
        {props.children}
      </PopperLayer>
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
const PopperLayer = styled('div', {
  zIndex: 1,
});
