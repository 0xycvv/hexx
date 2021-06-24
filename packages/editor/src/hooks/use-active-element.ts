import { useAtom } from 'jotai';
import { useEffect } from 'react';
import {
  activeBlockAtom
} from '../constants/atom';
import { debounce } from '../utils/debounce';

export const useActiveBlockId = () => {
  const [active, setActive] = useAtom(activeBlockAtom);

  const handleClick = () => {
    if (document.activeElement) {
      let editable;
      const isActiveElementEditable =
        document.activeElement.getAttribute('contenteditable') ===
        'true';
      if (isActiveElementEditable) {
        editable = document.activeElement;
      }
      const closetBlockId =
        document.activeElement.closest('[data-block-id]');
      if (closetBlockId) {
        const blockId = closetBlockId.getAttribute('data-block-id');
        setActive({
          id: blockId!,
          blockEl: closetBlockId as HTMLDivElement,
          editable,
        });
      } else {
        setActive(null);
      }
    } else {
      setActive(null);
    }
  };

  const debounced = debounce(handleClick, 300, false);

  useEffect(() => {
    document.addEventListener('mouseup', handleClick);
    document.addEventListener('keyup', debounced);
    return () => {
      document.removeEventListener('mouseup', handleClick);
      document.removeEventListener('keyup', debounced);
    };
  }, []);

  return active;
};
