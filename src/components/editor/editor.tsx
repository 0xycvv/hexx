import { Provider, useAtom } from 'jotai';
import { MouseEvent, ReactNode, useRef } from 'react';
import {
  DragDropContext,
  Droppable,
  DropResult,
} from 'react-beautiful-dnd';
import composeRefs from 'src/hooks/use-compose-ref';
import { useEditor } from 'src/hooks/use-editor';
import { styled } from 'src/stitches.config';
import { v4 } from 'uuid';
import {
  blockIdListAtom,
  blockMapAtom,
  blocksIdMapAtom,
  editorIdAtom,
  isSelectAllAtom,
} from '../../constants/atom';
import { BackspaceKey } from '../../constants/key';
import { useActiveBlockId } from '../../hooks/use-active-element';
import {
  findLastBlock,
  focusLastBlock,
  lastCursor,
} from '../../utils/find-blocks';
import { normalize } from '../../utils/normalize';
import { Block } from '../block/block';
import { Divider } from '../block/divider';
import { HeaderBlock } from '../block/header';
import { ListBlock } from '../block/list';
import { QuoteBlock } from '../block/quote';
import { TextBlock } from '../block/text';

export type BlockType<T = any> = {
  id: string;
  type: string;
  data: T;
};

export interface EditorProps {
  data?: BlockType[];
  children?: ReactNode;
  blockMap: Record<string, any>;
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
  paddingLeft: 'calc(96px + env(safe-area-inset-left))',
  paddingRight: 'calc(96px + env(safe-area-inset-right))',
  paddingBottom: '30vh',
  position: 'relative',
  a: {
    textDecoration: 'none',
  },
  'a:-webkit-any-link': {
    textDecoration: 'none',
  },
});

function Elliot(props: { children?: ReactNode }) {
  const [id] = useAtom(editorIdAtom);
  const [blockIdList, setBlockIdList] = useAtom(blockIdListAtom);
  const [blockIdMap] = useAtom(blocksIdMapAtom);
  const ref = useRef<HTMLDivElement>(null);
  const active = useActiveBlockId();
  const [isSelectAll, setIsSelectAll] = useAtom(isSelectAllAtom);
  const { insertBlock, clear } = useEditor();

  const handleClick = (e: MouseEvent) => {
    if (isSelectAll) {
      setIsSelectAll(false);
    }
    if (!active) {
      const lastBlock = findLastBlock();
      if (lastBlock) {
        if (lastBlock.editable) {
          if (lastBlock.editable?.textContent?.length > 0) {
            insertBlock({
              block: {
                type: 'paragraph',
                data: {
                  text: '',
                },
              },
            });
            lastBlock.editable?.focus();
          } else {
            lastBlock.editable?.focus();
          }
        } else {
          insertBlock({
            block: {
              type: 'paragraph',
              data: {
                text: '',
              },
            },
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
      return;
    }

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
            ref={composeRefs(ref, provided.innerRef) as any}
            className="elliot"
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
              <Block index={i} key={bId} block={blockIdMap[bId]} />
            ))}
          </Wrapper>
        )}
      </Droppable>
    </DragDropContext>
  );
}

export const Editor = (props: EditorProps) => {
  const { byId, ids } = normalize(props.data || [], 'id');
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
      <Elliot>{props.children}</Elliot>
    </Provider>
  );
};
