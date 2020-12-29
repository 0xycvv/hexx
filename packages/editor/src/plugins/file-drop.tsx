import { BlockData } from '@hexx/renderer/src/types';
import { useEventListener } from '../hooks';
import { usePlugin } from './plugin';

export function Unstable_FileDropPlugin(props: {
  resolve: (
    file: File[] | FileList,
  ) => BlockData | undefined | Promise<BlockData | undefined>;
}) {
  const {
    wrapperRef,
    drop: [dropId, setDropId],
    editor,
  } = usePlugin();
  const { insertBlockAfter } = editor;

  const dragOver = (e) => {
    const elements = document.elementsFromPoint(e.clientX, e.clientY);
    const closestBlock = elements.find((element) => {
      return (
        element instanceof HTMLElement && 'blockId' in element.dataset
      );
    });
    if (
      closestBlock instanceof HTMLElement &&
      'blockId' in closestBlock.dataset
    ) {
      setDropId(closestBlock.dataset.blockId!);
    }
    e.stopPropagation();
    e.preventDefault();
  };

  useEventListener('dragover', dragOver, wrapperRef);
  useEventListener(
    'dragstart',
    (e) => {
      e.preventDefault();
      e.stopPropagation();
    },
    wrapperRef,
  );
  useEventListener(
    'drop',
    async (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (dropId && e.dataTransfer?.files) {
        const resolvedBlock = await props.resolve(
          e.dataTransfer?.files,
        );
        if (resolvedBlock) {
          insertBlockAfter({
            id: dropId,
            block: resolvedBlock,
          });
        }
        setDropId(null);
        e.preventDefault();
        e.stopPropagation();
      }
    },
    wrapperRef,
  );

  return null;
}
