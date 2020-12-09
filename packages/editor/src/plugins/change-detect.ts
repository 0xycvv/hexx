import { useState } from 'react';
import useDeepCompareEffect from 'use-deep-compare-effect';
import { usePlugin } from './plugin';

export function ChangeDetectPlugin(props: { onChange: () => void }) {
  const [isMount, setIsMount] = useState(false);
  const { editor } = usePlugin();
  const { idMap, idList } = editor;
  useDeepCompareEffect(() => {
    if (isMount) {
      props.onChange();
    }
    return () => {
      setIsMount(true);
    };
  }, [idMap, idList]);
  return null;
}
