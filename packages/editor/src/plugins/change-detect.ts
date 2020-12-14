import { useAtom } from 'jotai';
import { useEffect, useState } from 'react';
import {
  _blockIdListAtom,
  _blocksIdMapAtom,
} from '../constants/atom';

export function ChangeDetectPlugin(props: { onChange: () => void }) {
  const [isMount, setIsMount] = useState(false);
  const [idMapAtom] = useAtom(_blocksIdMapAtom);
  const [idsAtom] = useAtom(_blockIdListAtom);

  useEffect(() => {
    if (isMount) {
      props?.onChange();
    }
    return () => {
      if (!isMount && typeof props?.onChange === 'function') {
        setIsMount(true);
      }
    };
  }, [idMapAtom, idsAtom]);

  return null;
}
