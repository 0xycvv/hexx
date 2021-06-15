import { useAtom } from 'jotai';
import {
  activeBlockAtom,
  blockSelectAtom,
  dropAtom,
  dropBlockAtom,
  editorDefaultBlockAtom,
  editorWrapperAtom,
  isEditorSelectAllAtom,
  selectAtom,
  uiStateAtom,
} from '../constants/atom';
import { useEditor } from '../hooks';

export function usePlugin() {
  const [wrapperRef] = useAtom(editorWrapperAtom);
  const uiState = useAtom(uiStateAtom);
  const defaultBlock = useAtom(editorDefaultBlockAtom);
  const [activeBlock] = useAtom(activeBlockAtom);
  const selectAll = useAtom(isEditorSelectAllAtom);
  const blockSelect = useAtom(selectAtom);
  const editor = useEditor();
  const drop = useAtom(dropAtom);

  return {
    wrapperRef,
    editor,
    defaultBlock,
    activeBlock,
    uiState,
    selectAll,
    blockSelect,
    drop,
  };
}
