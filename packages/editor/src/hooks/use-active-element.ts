import { atom, useAtom } from 'jotai';
import { useEffect, useRef, useState } from 'react';
import { activeBlockIdAtom } from '../constants/atom';

export const useActiveBlockId = () => {
  const [active, setActive] = useAtom(activeBlockIdAtom);

  const handleClick = () => {
    if (document.activeElement) {
      let editable;
      const isActiveElementEditable =
        document.activeElement.getAttribute('contenteditable') ===
        'true';
      if (isActiveElementEditable) {
        editable = document.activeElement;
      }
      const closetBlockId = document.activeElement.closest(
        '[data-block-id]',
      );
      if (closetBlockId) {
        const blockId = closetBlockId.getAttribute('data-block-id');
        setActive({
          id: blockId,
          blockEl: closetBlockId,
          editable,
        });
      } else {
        setActive(null);
      }
    } else {
      setActive(null);
    }
  };

  useEffect(() => {
    document.addEventListener('mouseup', handleClick);
    return () => {
      document.removeEventListener('mouseup', handleClick);
    };
  }, []);

  return active;
};
