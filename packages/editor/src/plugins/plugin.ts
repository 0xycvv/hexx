import { useAtom } from 'jotai';
import { useUpdateAtom } from 'jotai/utils';
import {
  activeBlockIdAtom,
  blockIdListAtom,
  blockSelectAtom,
  dropBlockAtom,
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
  const drop = useAtom(dropBlockAtom);

  return {
    wrapperRef,
    editor,
    defaultBlock,
    activeBlock,
    uiState,
    selectAll,
    ids,
    blockSelect,
    drop,
  };
}
