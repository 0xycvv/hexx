import { VirtualElement, Placement, Modifier } from '@popperjs/core';
import { useEffect, useState } from 'react';
import { usePopper } from 'react-popper';
import { useEventListener } from '../../hooks/use-event-listener';

export function useReactPopper(props: {
  defaultActive?: boolean;
  onClose?: () => void;
  placement: Placement;
  modifiers?: readonly Partial<Modifier<unknown, object>>[];
}) {
  const [active, setActive] = useState(props.defaultActive);
  const [popperElement, setPopperElement] = useState<HTMLElement>();
  const [referenceElement, setReferenceElement] = useState<
    VirtualElement | Element | HTMLElement
  >();

  const popper = usePopper(referenceElement, popperElement, {
    placement: props.placement,
    modifiers: [...(props.modifiers || [])],
    strategy: 'fixed',
  });

  useEventListener('mousedown', (e) => {
    if (e.target && popperElement?.contains(e.target)) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    setActive(false);
  });

  useEffect(() => {
    popper.forceUpdate?.();
    popper.update?.();
    if (!active) {
      props.onClose?.();
    }
  }, [active]);

  return {
    popperElement,
    active,
    setActive,
    setReferenceElement,
    popperJs: popper,
    getPopperProps: () => ({
      ref: setPopperElement,
      style: popper.styles.popper,
      hidden: !active,
      ...popper.attributes.popper,
    }),
  };
}
