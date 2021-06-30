import { paragraphStyle } from '@hexx/renderer';
import { css, CSS, styled } from '@hexx/theme';
import { Provider, useAtom } from 'jotai';
import { splitAtom, useAtomCallback } from 'jotai/utils';
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
  BlockAtom,
  blocksAtom,
  blockScopeAtom,
  blocksDataAtom,
  blockSelectAtom,
  createAtom,
  editorDefaultBlockAtom,
  editorIdAtom,
  editorWrapperAtom,
  isEditorSelectAllAtom,
  redo,
  selectDataAtom,
  uiStateAtom,
  undo,
  _blocksAtom,
  _hexxScope,
} from '../../constants/atom';
import { BackspaceKey } from '../../constants/key';
import { useEventListener } from '../../hooks';
import { useActiveBlockId } from '../../hooks/use-active-element';
import { useEditor, UseEditorReturn } from '../../hooks/use-editor';
import { usePlugin } from '../../plugins';
import { NewBlockOverlayPlugin } from '../../plugins/new-block-overlay';
import { BlockType } from '../../utils/blocks';
import {
  findBlockByIndex,
  findLastBlock,
  focusLastBlock,
  lastCursor,
} from '../../utils/find-blocks';
import { Block } from '../block/block';
import { ParagraphBlock } from '../block/text';

export interface EditorProps extends HexxProps {
  data?: BlockType[];
  scope: Record<string, any>;
}

interface HexxProps {
  wrapperRef?: MutableRefObject<HTMLDivElement>;
  children?: ReactNode;
  defaultBlock?: Omit<BlockType, 'id'>;
  css?: CSS;
  blockCss?: CSS;
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
  const [selectData] = useAtom(selectDataAtom);

  const handleClipboardEvent = (e: ClipboardEvent) => {
    if (blockSelect.size > 0) {
      setData(e);
      e.preventDefault();
    }
  };

  const setData = useAtomCallback(
    useCallback((get, set, e: ClipboardEvent) => {
      const blocksData = get(blocksDataAtom);
      const blocksToClip = isSelectAll ? blocksData : [...selectData];
      const selectedBlockNodeList = blocksToClip
        .map((b) =>
          document.querySelector(`[data-block-id='${b.id}']`),
        )
        .filter(Boolean);

      const text = selectedBlockNodeList
        .map((s) => s?.textContent)
        .join('\n\n');

      const htmlArray = selectedBlockNodeList.map(
        (s) => s?.innerHTML,
      ); // TODO: xss
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
    }, []),
    _hexxScope,
  );

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

const Hexx = forwardRef<HexxHandler, HexxProps>((props, ref) => {
  const [uiState, setUIState] = useAtom(uiStateAtom);
  const [blockSelect, setBlockSelect] = useAtom(blockSelectAtom);
  const [isSelectAll, setIsSelectAll] = useAtom(
    isEditorSelectAllAtom,
  );

  const [blocks, setBlocks] = useAtom(blocksAtom);

  const [, setWrapperRef] = useAtom(editorWrapperAtom);
  const editor = useEditor();
  const { clear, batchRemoveBlocks } = editor;

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
    if (blockSelect.size > 1) {
      const dragBlock = [...blockSelect].sort((a, b) => {
        return blocks.indexOf(a) - blocks.indexOf(b);
      });
      const items = blocks.filter((v) => !blockSelect.has(v));
      const newBlocks = [
        ...items.slice(0, newIndex),
        ...dragBlock,
        ...items.slice(newIndex, items.length),
      ];
      setBlocks(newBlocks);
    } else {
      const newBlocks = [...blocks];
      const dragBlock = newBlocks.splice(oldIndex, 1);
      newBlocks.splice(newIndex, 0, dragBlock[0]);
      setBlocks(newBlocks);
    }
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

  const wrapperRef = useRef<HTMLDivElement>();

  const composeRef = (node) => {
    wrapperRef.current = node;
    if (props.wrapperRef) {
      props.wrapperRef.current = node;
    }
  };

  useEffect(() => {
    if (wrapperRef.current) {
      setWrapperRef(wrapperRef.current);
    }
  }, []);

  const blocksWithFilters = useMemo(() => {
    return blocks.filter((block) => {
      // Do not hide the ghost of the element currently being sorted
      if (uiState.sortingItemKey === block) {
        return true;
      }

      // Hide the other items that are selected
      if (uiState.isSorting && blockSelect.has(block)) {
        return false;
      }

      // Do not hide any other items
      return true;
    });
  }, [
    uiState.sortingItemKey,
    uiState.isSorting,
    blockSelect,
    blocks,
  ]);

  return (
    <Wrapper
      css={props.css}
      ref={composeRef}
      className={`hexx ${css(paragraphStyle)()}`}
      onKeyDown={(e) => {
        if (e.key === BackspaceKey && isSelectAll) {
          clear();
          setIsSelectAll(false);
          requestAnimationFrame(() => {
            focusLastBlock();
            lastCursor();
          });
        } else if (e.key === BackspaceKey && blockSelect.size > 0) {
          batchRemoveBlocks([...blockSelect]);
          setBlockSelect(new Set([]));
        }
      }}
      onClick={(e) => {
        if (e.target instanceof HTMLAnchorElement) {
          window.open(e.target.href, '_blank', 'noopener noreferrer');
        }
      }}
    >
      <NewBlockOverlayPlugin />
      {props.children}
      <SortableBlockList
        updateBeforeSortStart={({ index }) => {
          setUIState((s) => ({
            ...s,
            isSorting: true,
            sortingItemKey: blocks[index],
          }));
        }}
        onSortStart={(_, event) => event.preventDefault()}
        useDragHandle
        onSortEnd={onDragEndHandler}
        blockCss={props.blockCss}
        blocks={blocksWithFilters}
        pressThreshold={300}
      />
      {/* {!props.autoFocus && <AutoFocusInput />} */}
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

const BlockListWrapper = styled('div', {
  width: '100%',
  position: 'relative',
});

const SortableBlockList = SortableContainer(
  ({ blockCss, blocks }: { blockCss: any; blocks: BlockAtom[] }) => {
    return (
      <BlockListWrapper className="hexx-block-list">
        {blocks.map((blockAtom, i) => (
          <Block
            index={i}
            key={blockAtom.toString()}
            blockAtom={blockAtom}
            css={blockCss}
          />
        ))}
      </BlockListWrapper>
    );
  },
);

export const Editor = forwardRef<HexxHandler, EditorProps>(
  (props, ref) => {
    const defaultBlock = props.defaultBlock || {
      type: ParagraphBlock.block.type,
      data: ParagraphBlock.block.defaultValue,
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
            [blockScopeAtom, props.scope],
            [_blocksAtom, initData],
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
