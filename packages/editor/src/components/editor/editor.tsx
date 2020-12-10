import { paragraphStyle } from '@hexx/renderer';
import { css, StitchesCssProp, styled } from '@hexx/theme';
import { Provider, useAtom } from 'jotai';
import {
  forwardRef,
  MutableRefObject,
  ReactNode,
  useEffect,
  useImperativeHandle,
} from 'react';
import {
  SortableContainer,
  SortEndHandler,
} from 'react-sortable-hoc';
import { v4 } from 'uuid';
import {
  blockIdListAtom,
  blockMapAtom,
  blockSelectAtom,
  blocksIdMapAtom,
  editorDefaultBlockAtom,
  editorIdAtom,
  editorWrapperAtom,
  isEditorSelectAllAtom,
  redo,
  uiStateAtom,
  undo,
  _blockIdListAtom,
  _blocksIdMapAtom,
  _hexxScope,
} from '../../constants/atom';
import { BackspaceKey } from '../../constants/key';
import { useEventListener } from '../../hooks';
import { useActiveBlockId } from '../../hooks/use-active-element';
import composeRefs from '../../hooks/use-compose-ref';
import { useEditor } from '../../hooks/use-editor';
import { usePlugin } from '../../plugins';
import { NewBlockOverlayPlugin } from '../../plugins/new-block-overlay';
import { PastHtmlPlugin } from '../../plugins/paste';
import {
  findLastBlock,
  focusLastBlock,
  lastCursor,
} from '../../utils/find-blocks';
import { normalize } from '../../utils/normalize';
import { Block } from '../block/block';
import { TextBlock } from '../block/text';

export type BlockType<T = any> = {
  id: string;
  type: string;
  data: T;
};

export interface EditorProps extends HexxProps {
  data?: BlockType[];
  blockMap: Record<string, any>;
}

interface HexxProps {
  wrapperRef?: MutableRefObject<HTMLDivElement>;
  children?: ReactNode;
  plusButton?: ReactNode;
  tuneButton?: ReactNode;
  defaultBlock?: Omit<BlockType, 'id'>;
  css?: StitchesCssProp;
  blockCss?: StitchesCssProp;
}

const Wrapper = styled('div', {
  flexShrink: 0,
  flexGrow: 1,
  width: '100%',
  maxWidth: '100%',
  display: 'flex',
  alignItems: 'center',
  flexDirection: 'column',
  fontSize: 16,
  lineHeight: 1.5,
  color: 'rgb(55, 53, 47)',
  paddingLeft:
    'min(calc(100% * 0.1 + env(safe-area-inset-left)), 100px)',
  paddingRight:
    'min(calc(100% * 0.1 + env(safe-area-inset-right)), 100px)',
  paddingBottom: '30vh',
  position: 'relative',
  a: {
    color: '$link',
    textDecoration: 'none',
  },
  'a:-webkit-any-link': {
    textDecoration: 'none',
  },
});

interface HexxHandler {
  getData: () => BlockType[];
  focus: () => void;
  undo: () => void;
}

function useBlockSelectCopy() {
  const { wrapperRef, editor } = usePlugin();
  const { blockSelect, setIdList } = editor;
  const handleClipboardEvent = (e: ClipboardEvent) => {
    if (blockSelect.length > 0) {
      setData(e);
      e.preventDefault();
    }
  };

  const setData = (e: ClipboardEvent) => {
    const selectedBlockNodeList = blockSelect
      .map((bId) =>
        document.querySelector(`[data-block-id='${bId}']`),
      )
      .filter(Boolean);
    const text = selectedBlockNodeList
      .map((s) => s?.textContent)
      .join('\n\n');

    const htmlArray = selectedBlockNodeList.map((s) => s?.innerHTML); // TODO: xss
    let html = document.createElement('div');
    for (const innerHTML of htmlArray) {
      const frag = document.createElement('p');
      frag.innerHTML = innerHTML!;
      html.appendChild(frag);
    }
    e.clipboardData?.setData('text/plain', text);
    e.clipboardData?.setData('text/html', html.innerHTML);
  };

  useEventListener('copy', handleClipboardEvent, wrapperRef);
  useEventListener(
    'cut',
    (e) => {
      if (blockSelect.length > 0) {
        setData(e);
        setIdList((s) => s.filter((id) => !blockSelect.includes(id)));
        e.preventDefault();
      }
    },
    wrapperRef,
  );
}

const Hexx = forwardRef<HexxHandler, HexxProps>((props, ref) => {
  const [id] = useAtom(editorIdAtom);
  const [uiState, setUIState] = useAtom(uiStateAtom);
  const [blockIdList, setBlockIdList] = useAtom(blockIdListAtom);
  const [blockIdMap] = useAtom(blocksIdMapAtom);
  const active = useActiveBlockId();
  const [blockSelect, setBlockSelect] = useAtom(blockSelectAtom);
  const [isSelectAll, setIsSelectAll] = useAtom(
    isEditorSelectAllAtom,
  );
  const [, setWrapperRef] = useAtom(editorWrapperAtom);
  const { insertBlock, clear, batchRemoveBlocks } = useEditor();

  useEffect(() => {
    if (
      blockIdList.length === 0 ||
      Object.keys(blockIdMap).length === 0
    ) {
      insertBlock({ block: props.defaultBlock, index: 0 });
    }
  }, [blockIdList, blockIdMap]);

  useBlockSelectCopy();

  const onDragEndHandler: SortEndHandler = ({
    newIndex,
    oldIndex,
  }) => {
    if (blockSelect.length > 1) {
      const items = blockIdList.filter(
        (v) => !blockSelect.includes(v),
      );
      const newBlocks = [
        ...items.slice(0, newIndex),
        ...blockSelect,
        ...items.slice(newIndex, items.length),
      ];
      setBlockIdList(newBlocks);
    } else {
      const newBlocks = [...blockIdList];
      const dragBlock = newBlocks.splice(oldIndex, 1);
      newBlocks.splice(newIndex, 0, dragBlock[0]);
      setBlockIdList(newBlocks);
    }
    setUIState((s) => ({
      ...s,
      isSorting: false,
      sortingItemKey: undefined,
    }));
  };

  useImperativeHandle(ref, () => ({
    getData: () => blockIdList.map((bId) => blockIdMap[bId]),
    focus: () => findLastBlock()?.editable?.focus(),
    undo: undo,
    redo: redo,
  }));

  return (
    <Wrapper
      css={props.css}
      ref={
        composeRefs(props.wrapperRef, (s) => setWrapperRef(s)) as any
      }
      className={`hexx ${css(paragraphStyle)}`}
      onKeyDown={(e) => {
        if (e.key === BackspaceKey && isSelectAll) {
          clear();
          setIsSelectAll(false);
          requestAnimationFrame(() => {
            focusLastBlock();
            lastCursor();
          });
        } else if (e.key === BackspaceKey && blockSelect.length > 0) {
          batchRemoveBlocks({ ids: blockSelect });
          setBlockSelect([]);
        }
      }}
    >
      <NewBlockOverlayPlugin />
      <PastHtmlPlugin />
      {props.children}
      <SortableBlockList
        updateBeforeSortStart={({ index }) => {
          setUIState((s) => ({
            ...s,
            isSorting: true,
            sortingItemKey: blockIdList[index],
          }));
        }}
        useDragHandle
        pressDelay={10}
        onSortEnd={onDragEndHandler}
        blockCss={props.blockCss}
        blockIdList={blockIdList.filter((id) => {
          // Do not hide the ghost of the element currently being sorted
          if (uiState.sortingItemKey === id) {
            return true;
          }

          // Hide the other items that are selected
          if (uiState.isSorting && blockSelect.includes(id)) {
            return false;
          }

          // Do not hide any other items
          return true;
        })}
        blockIdMap={blockIdMap}
      />
      {props.tuneButton}
      {props.plusButton}
    </Wrapper>
  );
});

const SortableBlockList = SortableContainer(
  ({
    blockCss,
    blockIdList,
    blockIdMap,
  }: {
    blockCss: any;
    blockIdList: string[];
    blockIdMap: Record<string, BlockType>;
  }) => (
    <div
      className={css({
        width: '100%',
      })}
    >
      {blockIdList.map(
        (bId, i) =>
          bId &&
          blockIdMap[bId] && (
            <Block
              key={bId}
              css={blockCss}
              id={bId}
              index={i}
              // block={blockIdMap[bId]}
            />
          ),
      )}
    </div>
  ),
);

export const Editor = forwardRef<HexxHandler, EditorProps>(
  (props, ref) => {
    const defaultBlock = props.defaultBlock || {
      type: TextBlock.block.type,
      data: TextBlock.block.defaultValue,
    };
    const { byId, ids } = normalize(
      props.data || [{ ...defaultBlock, id: v4() }],
      'id',
    );
    return (
      <Provider
        scope={_hexxScope}
        // @ts-ignore
        initialValues={[
          [_blockIdListAtom, ids],
          [_blocksIdMapAtom, byId],
          [editorDefaultBlockAtom, defaultBlock],
          [editorIdAtom, v4()],
          [blockMapAtom, props.blockMap],
        ]}
      >
        <Hexx
          ref={ref}
          wrapperRef={props.wrapperRef}
          defaultBlock={defaultBlock}
          tuneButton={props.tuneButton}
          plusButton={props.plusButton}
          css={props.css}
          blockCss={props.blockCss}
        >
          {props.children}
        </Hexx>
      </Provider>
    );
  },
);
