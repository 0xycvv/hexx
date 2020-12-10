import { useAtom } from 'jotai';
import {
  activeBlockIdAtom,
  blockIdListAtom,
  blockSelectAtom,
  editorDefaultBlockAtom,
  editorWrapperAtom,
  isEditorSelectAllAtom,
  uiStateAtom,
} from '../constants/atom';
import { useEditor } from '../hooks';

export function usePlugin() {
  const [wrapperRef] = useAtom(editorWrapperAtom);
  const uiState = useAtom(uiStateAtom);
  const defaultBlock = useAtom(editorDefaultBlockAtom);
  const [activeBlock] = useAtom(activeBlockIdAtom);
  const selectAll = useAtom(isEditorSelectAllAtom);
  const blockSelect = useAtom(blockSelectAtom);
  const editor = useEditor();
  const ids = useAtom(blockIdListAtom);

  return {
    wrapperRef,
    editor,
    defaultBlock,
    activeBlock,
    uiState,
    selectAll,
    ids,
    blockSelect,
  };
}
