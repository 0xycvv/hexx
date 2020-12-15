import { useEffect } from 'react';
import { usePlugin } from './plugin';

export function EditorWidthPlugin() {
  const {
    wrapperRef,
    uiState: [, setUIState],
  } = usePlugin();

  useEffect(() => {
    if (!wrapperRef) return;
    // @ts-ignore
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect) {
          setUIState((s) => ({
            ...s,
            editorWidth: entry.contentRect.width,
          }));
        }
      }
    });
    resizeObserver.observe(wrapperRef);

    return () => {
      if (
        resizeObserver &&
        'unobserve' in resizeObserver &&
        wrapperRef
      ) {
        resizeObserver.unobserve(wrapperRef);
      }
    };
  }, []);

  return null;
}
