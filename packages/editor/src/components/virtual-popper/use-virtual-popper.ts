import type {
  VirtualElement,
  Placement,
  Modifier,
} from '@popperjs/core';
import { useState } from 'react';
import { usePopper } from 'react-popper';
import { useEventListener } from '../../hooks/use-event-listener';

export function useReactPopper(props: {
  defaultActive?: boolean;
  placement: Placement;
  modifiers?: readonly Partial<Modifier<unknown, object>>[];
}) {
  const [active, setActive] = useState(props.defaultActive);
  const [popperElement, setPopperElement] = useState(null);
  const [referenceElement, setReferenceElement] = useState<
    VirtualElement | Element
  >(null);

  const popper = usePopper(referenceElement, popperElement, {
    placement: props.placement,
    modifiers: props.modifiers,
    strategy: 'absolute',
  });

  useEventListener('mousedown', (e) => {
    if (popperElement?.contains(e.target)) {
      return;
    }
    setActive(false);
  });

  return {
    popperElement,
    active,
    setActive,
    setReferenceElement,
    getPopperProps: () => ({
      ref: setPopperElement,
      style: popper.styles.popper,
      hidden: !active,
      ...popper.attributes.popper,
    }),
  };
}
