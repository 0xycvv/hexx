import { paragraphStyle } from '@hexx/renderer';
import { css, StitchesCssProp, styled } from '@hexx/theme';
import { Provider, useAtom } from 'jotai';
import { splitAtom, useAtomCallback, useUpdateAtom } from 'jotai/utils';
import {
  forwardRef,
  MutableRefObject,
  ReactNode,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import {
  SortableContainer,
  SortEndHandler,
} from 'react-sortable-hoc';
import { v4 } from 'uuid';
import { CLIPBOARD_DATA_FORMAT } from '../../constants';
import {
  blockMapAtom,
  blocksAtom,
  blocksDataAtom,
  blockSelectAtom,
  blocksIdMapAtom,
  createAtom,
  editorDefaultBlockAtom,
  editorIdAtom,
  editorWrapperAtom,
  isEditorSelectAllAtom,
  redo,
  selectDataAtom,
  uiStateAtom,
  undo,
  _hexxScope,
} from '../../constants/atom';
import { useEventListener } from '../../hooks';
import { useActiveBlockId } from '../../hooks/use-active-element';
import composeRefs from '../../hooks/use-compose-ref';
import { useEditor, UseEditorReturn } from '../../hooks/use-editor';
import { usePlugin } from '../../plugins';
import { NewBlockOverlayPlugin } from '../../plugins/new-block-overlay';
import { BlockType } from '../../utils/blocks';
import {
  findBlockByIndex,
  findLastBlock,
} from '../../utils/find-blocks';
import { BlockV2 } from '../block/block';
import { TextBlock } from '../block/text';

export interface EditorProps extends HexxProps {
  data?: BlockType[];
  blockMap: Record<string, any>;
}

interface HexxProps {
  wrapperRef?: MutableRefObject<HTMLDivElement>;
  children?: ReactNode;
  defaultBlock?: Omit<BlockType, 'id'>;
  css?: StitchesCssProp;
  blockCss?: StitchesCssProp;
  onLoad?: () => void;
  autoFocus?: boolean;
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
  getData: () => Promise<BlockType[]>;
  getEditor: () => UseEditorReturn;
  focus: (config?: {
    index?: number;
    preventScroll?: boolean;
  }) => void;
  undo: () => void;
}

function useBlockSelectCopy() {
  const {
    wrapperRef,
    blockSelect: [blockSelect],
    selectAll: [isSelectAll],
  } = usePlugin();

  const [, setBlocks] = useAtom(blocksAtom);
  const [blocksData] = useAtom(blocksDataAtom);
  const [selectData] = useAtom(selectDataAtom);

  const handleClipboardEvent = (e: ClipboardEvent) => {
    if (blockSelect.size > 0) {
      setData(e);
      e.preventDefault();
    }
  };

  const setData = (e: ClipboardEvent) => {
    const blocksToClip = isSelectAll ? blocksData : [...selectData];
    const selectedBlockNodeList = blocksToClip
      .map((b) => document.querySelector(`[data-block-id='${b.id}']`))
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
    e.clipboardData?.setData(
      CLIPBOARD_DATA_FORMAT,
      JSON.stringify(blocksToClip),
    );
    e.clipboardData?.setData('text/plain', text);
    e.clipboardData?.setData('text/html', html.innerHTML);
  };

  useEventListener('copy', handleClipboardEvent, wrapperRef);
  useEventListener(
    'cut',
    (e) => {
      if (blockSelect.size > 0) {
        setData(e);
        setBlocks((s) => s.filter((b) => !blockSelect.has(b)));
        e.preventDefault();
      } else if (isSelectAll) {
        setData(e);
        setBlocks([]);
        e.preventDefault();
      }
    },
    wrapperRef,
  );
}

const test = createAtom('');

const Hexx = forwardRef<HexxHandler, HexxProps>((props, ref) => {
  const [uiState, setUIState] = useAtom(uiStateAtom);
  const [blockIdMap] = useAtom(blocksIdMapAtom);
  const [blockSelect, setBlockSelect] = useAtom(blockSelectAtom);
  const [isSelectAll, setIsSelectAll] = useAtom(
    isEditorSelectAllAtom,
  );

  const [, setWrapperRef] = useAtom(editorWrapperAtom);
  const editor = useEditor();
  const { insertBlock, clear, batchRemoveBlocks } = editor;

  // useEffect(() => {
  //   if (
  //     blockIdList.length === 0 ||
  //     Object.keys(blockIdMap).length === 0
  //   ) {
  //     insertBlock({ block: props.defaultBlock, index: 0 });
  //   }
  // }, [blockIdList, blockIdMap]);

  useEffect(() => {
    props.onLoad?.();
  }, [props.onLoad]);

  useActiveBlockId();
  useBlockSelectCopy();

  const onDragEndHandler: SortEndHandler = ({
    newIndex,
    oldIndex,
  }) => {
    // if (blockSelect.size > 1) {
    //   const dragBlock = [...blockSelect].sort((a, b) => {
    //     return blockIdList.indexOf(a) - blockIdList.indexOf(b);
    //   });
    //   const items = blockIdList.filter((v) => !blockSelect.has(v));
    //   const newBlocks = [
    //     ...items.slice(0, newIndex),
    //     ...dragBlock,
    //     ...items.slice(newIndex, items.length),
    //   ];
    //   setBlockIdList(newBlocks);
    // } else {
    //   const newBlocks = [...blockIdList];
    //   const dragBlock = newBlocks.splice(oldIndex, 1);
    //   newBlocks.splice(newIndex, 0, dragBlock[0]);
    //   setBlockIdList(newBlocks);
    // }
    setUIState((s) => ({
      ...s,
      isSorting: false,
      sortingItemKey: undefined,
    }));
  };

  const getData = useAtomCallback(
    useCallback((get) => {
      return get(blocksDataAtom);
    }, []),
    _hexxScope,
  );

  useImperativeHandle(ref, () => ({
    getData,
    focus: (
      { index, preventScroll } = {
        index: undefined,
        preventScroll: false,
      },
    ) => {
      if (typeof index === 'number') {
        findBlockByIndex(index, true)?.editable?.focus({
          preventScroll,
        });
      } else {
        findLastBlock()?.editable?.focus({ preventScroll });
      }
    },
    getEditor: () => editor,
    undo: undo,
    redo: redo,
  }));

  const composeRef = (node) => {
    console.log('?????');
    setWrapperRef(node);
    // ref = node;
    if (props.wrapperRef) {
      props.wrapperRef.current = node;
    }
  };

  return (
    <Wrapper
      css={props.css}
      ref={composeRef}
      className={`hexx ${css(paragraphStyle)()}`}
      onKeyDown={(e) => {
        // if (e.key === BackspaceKey && isSelectAll) {
        //   clear();
        //   setIsSelectAll(false);
        //   requestAnimationFrame(() => {
        //     focusLastBlock();
        //     lastCursor();
        //   });
        // } else if (e.key === BackspaceKey && blockSelect.size > 0) {
        //   batchRemoveBlocks({ ids: [...blockSelect] });
        //   setBlockSelect(new Set([]));
        // }
      }}
      onClick={(e) => {
        if (e.target instanceof HTMLAnchorElement) {
          window.open(e.target.href, '_blank', 'noopener noreferrer');
        }
      }}
    >
      {/* <NewBlockOverlayPlugin /> */}
      {/* <PastHtmlPlugin /> */}
      {/* {props.children} */}
      <SortableBlockList
        updateBeforeSortStart={({ index }) => {
          // setUIState((s) => ({
          //   ...s,
          //   isSorting: true,
          //   sortingItemKey: blockIdList[index],
          // }));
        }}
        onSortStart={(_, event) => event.preventDefault()}
        useDragHandle
        onSortEnd={onDragEndHandler}
        blockCss={props.blockCss}
        // blockIdList={blockIdList.filter((id) => {
        //   // Do not hide the ghost of the element currently being sorted
        //   if (uiState.sortingItemKey === id) {
        //     return true;
        //   }

        //   // Hide the other items that are selected
        //   if (uiState.isSorting && blockSelect.has(id)) {
        //     return false;
        //   }

        //   // Do not hide any other items
        //   return true;
        // })}
        // blockIdMap={blockIdMap}
      />
      {!props.autoFocus && <AutoFocusInput />}
    </Wrapper>
  );
});

function AutoFocusInput() {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    requestAnimationFrame(() => {
      inputRef?.current?.focus();
    });
  }, []);

  return (
    <input
      ref={inputRef}
      autoFocus
      aria-hidden="true"
      style={{
        top: 0,
        position: 'absolute',
        left: '-100000px',
      }}
    />
  );
}

const SortableBlockList = SortableContainer(
  ({ blockCss }: { blockCss: any }) => {
    const [blocks] = useAtom(blocksAtom);
    return (
      <div
        className={css({
          width: '100%',
        })()}
      >
        {blocks.map((blockAtom, i) => (
          <BlockV2
            index={i}
            key={blockAtom.toString()}
            blockAtom={blockAtom}
            css={blockCss}
          />
        ))}
      </div>
    );
  },
);

export const Editor = forwardRef<HexxHandler, EditorProps>(
  (props, ref) => {
    const defaultBlock = props.defaultBlock || {
      type: TextBlock.block.type,
      data: TextBlock.block.defaultValue,
    };

    const initDataAtom = useMemo(() => {
      const dataAtom = createAtom(props.data || []);
      return splitAtom(dataAtom);
    }, []);

    const [initData] = useAtom(initDataAtom);

    return (
      <Provider
        scope={_hexxScope}
        initialValues={
          [
            [editorDefaultBlockAtom, defaultBlock],
            [editorIdAtom, v4()],
            [blockMapAtom, props.blockMap],
            [blocksAtom, initData],
          ] as const
        }
      >
        <Hexx
          ref={ref}
          wrapperRef={props.wrapperRef}
          defaultBlock={defaultBlock}
          css={props.css}
          blockCss={props.blockCss}
          onLoad={props.onLoad}
          autoFocus={props.autoFocus}
        >
          {props.children}
        </Hexx>
      </Provider>
    );
  },
);
