import { paragraphStyle } from '@hexx/renderer';
import { css, StitchesCssProp, styled } from '@hexx/theme';
import { Provider, useAtom } from 'jotai';
import {
  forwardRef,
  MouseEvent,
  MutableRefObject,
  ReactNode,
  useImperativeHandle,
} from 'react';
import {
  SortableContainer,
  SortableElement,
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
  undo,
  _blockIdListAtom,
  _blocksIdMapAtom,
  _hexxScope,
} from '../../constants/atom';
import { BackspaceKey } from '../../constants/key';
import { useActiveBlockId } from '../../hooks/use-active-element';
import composeRefs from '../../hooks/use-compose-ref';
import { useEditor } from '../../hooks/use-editor';
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
  watch: (cb: Function) => void;
  undo: () => void;
}

const Hexx = forwardRef<HexxHandler, HexxProps>((props, ref) => {
  const [id] = useAtom(editorIdAtom);
  const [blockIdList, setBlockIdList] = useAtom(blockIdListAtom);
  const [blockIdMap] = useAtom(blocksIdMapAtom);
  const active = useActiveBlockId();
  const [blockSelect, setBlockSelect] = useAtom(blockSelectAtom);
  const [isSelectAll, setIsSelectAll] = useAtom(
    isEditorSelectAllAtom,
  );
  const [, setWrapperRef] = useAtom(editorWrapperAtom);
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

  const onDragEndHandler: SortEndHandler = ({
    newIndex,
    oldIndex,
  }) => {
    setBlockSelect(newIndex);
    const newBlocks = [...blockIdList];
    const dragBlock = newBlocks.splice(oldIndex, 1);
    newBlocks.splice(newIndex, 0, dragBlock[0]);
    setBlockIdList(newBlocks);
  };

  useImperativeHandle(ref, () => ({
    getData: () => blockIdList.map((bId) => blockIdMap[bId]),
    focus: () => findLastBlock()?.editable?.focus(),
    watch: (cb) => {
      typeof cb === 'function' && cb();
    },
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
    >
      <PastHtmlPlugin />
      {props.children}
      <SortableBlockList
        useDragHandle
        onSortEnd={onDragEndHandler}
        blockCss={props.blockCss}
        blockIdList={blockIdList}
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
              index={i}
              block={blockIdMap[bId]}
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
