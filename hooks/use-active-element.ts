import { atom, useAtom } from 'jotai';
import { useEffect, useRef, useState } from 'react';
import { activeBlockIdAtom } from '../constants/atom';

export const useActiveBlockId = () => {
  const [active, setActive] = useAtom(activeBlockIdAtom);

  const handleClick = () => {
    if (document.activeElement) {
      // console.log(
      //   document.activeElement,
      //   document.activeElement.closest('[data-block-id]'),
      // );
      const closetBlockId = document.activeElement.closest(
        '[data-block-id]',
      );
      if (closetBlockId) {
        setActive(closetBlockId);
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
