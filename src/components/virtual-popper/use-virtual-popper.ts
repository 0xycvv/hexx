import type {
  VirtualElement,
  Placement,
  Modifier,
} from '@popperjs/core';
import { useState } from 'react';
import { usePopper } from 'react-popper';

export function useVirtualPopper(props: {
  defaultActive?: boolean;
  placement: Placement;
  modifiers?: readonly Partial<Modifier<unknown, object>>[];
}) {
  const [active, setActive] = useState(props.defaultActive);
  const [popperElement, setPopperElement] = useState(null);
  const [referenceElement, setReferenceElement] = useState<
    VirtualElement
  >(null);

  const popper = usePopper(referenceElement, popperElement, {
    placement: props.placement,
    modifiers: props.modifiers,
    strategy: 'absolute',
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
