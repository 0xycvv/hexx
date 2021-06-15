import { useAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { blocksAtom } from '../constants/atom';

export function ChangeDetectPlugin(props: { onChange: () => void }) {
  const [isMount, setIsMount] = useState(false);
  const [blocks] = useAtom(blocksAtom);

  useEffect(() => {
    if (isMount) {
      props?.onChange();
    }
    return () => {
      if (!isMount && typeof props?.onChange === 'function') {
        setIsMount(true);
      }
    };
  }, [blocks]);

  return null;
}
