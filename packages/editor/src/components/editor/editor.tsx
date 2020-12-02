import { paragraphStyle } from '@elliot/renderer';
import { css, styled, StitchesCssProp } from '@elliot/theme';
import { Provider, useAtom } from 'jotai';
import { MouseEvent, ReactNode, useRef } from 'react';
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
} from '../../constants/atom';
import { BackspaceKey } from '../../constants/key';
import { useActiveBlockId } from '../../hooks/use-active-element';
import composeRefs from '../../hooks/use-compose-ref';
import { useEditor } from '../../hooks/use-editor';
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

export interface EditorProps extends ElliotProps {
  data?: BlockType[];
  blockMap: Record<string, any>;
}

interface ElliotProps {
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

function Elliot(props: ElliotProps) {
  const defaultBlock = props.defaultBlock || {
    type: TextBlock.block.type,
    data: TextBlock.block.defaultValue,
  };
  const [id] = useAtom(editorIdAtom);
  const [blockIdList, setBlockIdList] = useAtom(blockIdListAtom);
  const [blockIdMap] = useAtom(blocksIdMapAtom);
  const ref = useRef<HTMLDivElement>(null);
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
              block: defaultBlock,
            });
            lastBlock.editable?.focus();
          } else {
            lastBlock.editable?.focus();
          }
        } else {
          insertBlock({
            block: defaultBlock,
          });
        }
      }
    } else {
      active?.editable?.focus();
    }
  };

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

  return (
    <DragDropContext onDragEnd={onDragEndHandler}>
      <Droppable droppableId={id}>
        {(provided) => (
          <Wrapper
            css={props.css}
            ref={composeRefs(ref, provided.innerRef) as any}
            className={`elliot ${css(paragraphStyle)}`}
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
            {blockIdList.map((bId, i) => (
              <Block
                css={props.blockCss}
                key={bId}
                index={i}
                block={blockIdMap[bId]}
              />
            ))}
            {props.tuneButton}
            {props.plusButton}
            {provided.placeholder}
          </Wrapper>
        )}
      </Droppable>
    </DragDropContext>
  );
}

export const Editor = (props: EditorProps) => {
  const { byId, ids } = normalize(props.data, 'id');
  return (
    <Provider
      // @ts-ignore
      initialValues={[
        [blockIdListAtom, ids],
        [blocksIdMapAtom, byId],
        [editorIdAtom, v4()],
        [blockMapAtom, props.blockMap],
      ]}
    >
      <Elliot
        defaultBlock={props.defaultBlock}
        tuneButton={props.tuneButton}
        plusButton={props.plusButton}
      >
        {props.children}
      </Elliot>
    </Provider>
  );
};
