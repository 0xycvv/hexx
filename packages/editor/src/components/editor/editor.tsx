import { paragraphStyle } from '@hexx/renderer';
import { css, styled, StitchesCssProp } from '@hexx/theme';
import { Provider, useAtom } from 'jotai';
import {
  forwardRef,
  MouseEvent,
  MutableRefObject,
  ReactNode,
  useImperativeHandle,
  useRef,
} from 'react';
import {
  DragDropContext,
  Droppable,
  DropResult,
} from 'react-beautiful-dnd';
import { v4 } from 'uuid';
import {
  blockIdListAtom,
  blockMapAtom,
  blockSelectAtom,
  blocksIdMapAtom,
  editorIdAtom,
  isEditorSelectAllAtom,
  _blockIdListAtom,
  _blocksIdMapAtom,
  _hexxScope,
  history,
} from '../../constants/atom';
import { BackspaceKey } from '../../constants/key';
import { useEventListener } from '../../hooks';
import { useActiveBlockId } from '../../hooks/use-active-element';
import composeRefs from '../../hooks/use-compose-ref';
import { useEditor } from '../../hooks/use-editor';
import { useSelectionChange } from '../../hooks/use-selection-change';
import { processor } from '../../parser/html';
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
  onSelectionChange?: (
    e: DocumentEventMap['selectionchange'],
  ) => void;
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
  watch: (cb: Function) => void;
  history: () => void;
}

const Hexx = forwardRef<HexxHandler, HexxProps>((props, ref) => {
  const wrapperRef = useRef<HTMLDivElement>();
  const [id] = useAtom(editorIdAtom);
  const [blockIdList, setBlockIdList] = useAtom(blockIdListAtom);
  const [blockIdMap] = useAtom(blocksIdMapAtom);
  const active = useActiveBlockId();
  const [blockSelect, setBlockSelect] = useAtom(blockSelectAtom);
  const [isSelectAll, setIsSelectAll] = useAtom(
    isEditorSelectAllAtom,
  );
  const { insertBlock, clear } = useEditor();

  const handleClick = (e: MouseEvent) => {
    if (blockSelect > -1) {
      setBlockSelect(-1);
      return;
    }
    if (isSelectAll) {
      setIsSelectAll(false);
    }
    if (!active) {
      const lastBlock = findLastBlock();
      if (lastBlock) {
        if (lastBlock.editable) {
          if ((lastBlock?.editable?.textContent?.length ?? 0) > 0) {
            insertBlock({
              block: props.defaultBlock,
            });
            lastBlock.editable?.focus();
          } else {
            lastBlock.editable?.focus();
          }
        } else {
          insertBlock({
            block: props.defaultBlock,
          });
        }
      }
    } else {
      active?.editable?.focus();
    }
  };

  useSelectionChange((e) => {
    props.onSelectionChange?.(e);
  }, wrapperRef.current);

  useEventListener(
    'paste',
    (e) => {
      const html = e.clipboardData?.getData('text/html');
      if (!html) return;
      const htmlAST = processor.parse(html);
      console.log(htmlAST);
    },
    wrapperRef.current,
  );

  const onDragEndHandler = (result: DropResult) => {
    const { destination, source } = result;

    if (!destination || destination.index === source.index) {
      setBlockSelect(-1);
      return;
    }
    setBlockSelect(destination.index);

    const newBlocks = [...blockIdList];
    const dragBlock = newBlocks.splice(source.index, 1);
    newBlocks.splice(destination.index, 0, dragBlock[0]);
    setBlockIdList(newBlocks);
  };

  useImperativeHandle(ref, () => ({
    getData: () => blockIdList.map((bId) => blockIdMap[bId]),
    focus: () => findLastBlock()?.editable?.focus(),
    watch: (cb) => {
      typeof cb === 'function' && cb();
    },
    history: () => {
      const last = history.pop();
      if (last) {
        console.log(last);
        last.undo();
      }
    },
  }));

  return (
    <DragDropContext onDragEnd={onDragEndHandler}>
      <Droppable droppableId={id}>
        {(provided) => (
          <Wrapper
            css={props.css}
            ref={
              composeRefs(
                props.wrapperRef,
                provided.innerRef,
                wrapperRef,
              ) as any
            }
            className={`hexx ${css(paragraphStyle)}`}
            onClick={handleClick}
            onKeyDown={(e) => {
              if (e.key === BackspaceKey && isSelectAll) {
                clear();
                setIsSelectAll(false);
                requestAnimationFrame(() => {
                  focusLastBlock();
                  lastCursor();
                });
              }
            }}
            {...provided.droppableProps}
          >
            {props.children}
            {blockIdList.map(
              (bId, i) =>
                bId &&
                blockIdMap[bId] && (
                  <Block
                    css={props.blockCss}
                    key={bId}
                    index={i}
                    block={blockIdMap[bId]}
                  />
                ),
            )}
            {props.tuneButton}
            {props.plusButton}
            {provided.placeholder}
          </Wrapper>
        )}
      </Droppable>
    </DragDropContext>
  );
});

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
          [editorIdAtom, v4()],
          [blockMapAtom, props.blockMap],
        ]}
      >
        <Hexx
          ref={ref}
          onSelectionChange={props.onSelectionChange}
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
