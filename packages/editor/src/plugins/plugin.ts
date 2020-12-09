import { useAtom } from 'jotai';
import {
  editorDefaultBlockAtom,
  editorWrapperAtom,
  isEditorSelectAllAtom,
  uiStateAtom,
} from '../constants/atom';
import { useEditor } from '../hooks';
import { useActiveBlockId } from '../hooks/use-active-element';
export function usePlugin() {
  const [wrapperRef] = useAtom(editorWrapperAtom);
  const uiState = useAtom(uiStateAtom);
  const [defaultBlock] = useAtom(editorDefaultBlockAtom);
  const editor = useEditor();
  const activeBlock = useActiveBlockId();
  const selectAll = useAtom(
    isEditorSelectAllAtom,
  );

  return {
    wrapperRef,
    editor,
    defaultBlock,
    activeBlock,
    uiState,
    selectAll
  };
}
