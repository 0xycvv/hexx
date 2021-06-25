import { useAtom, PrimitiveAtom } from 'jotai';
import { useEffect, useRef } from 'react';

export function usePreviousExistAtom(atom) {
  const [value] = useAtom(atom);
  const ref = useRef();

  // Store current value in ref
  useEffect(() => {
    if (value) {
      ref.current = atom;
    }
  }, [value, atom]); // Only re-run if value changes

  // Return previous value (happens before update in useEffect above)
  return ref.current;
}
