import { Provider, useAtom } from 'jotai';
import { useUpdateAtom } from 'jotai/utils.cjs';
import {
  createElement,
  MouseEvent,
  ReactNode,
  useEffect,
  useRef,
} from 'react';
import {
  DragDropContext,
  Droppable,
  DropResult,
} from 'react-beautiful-dnd';
import composeRefs from 'src/hooks/use-compose-ref';
import { styled } from 'src/stitches.config';
import { insert } from 'src/utils/insert';
import { v4 } from 'uuid';
import {
  blockMapAtom,
  blocksAtom,
  editorIdAtom,
  isSelectAllAtom,
} from '../../constants/atom';
import { BackspaceKey } from '../../constants/key';
import { useActiveBlockId } from '../../hooks/use-active-element';
import {
  findBlockByIndex,
  findLastBlock,
  focusLastBlock,
  lastCursor,
} from '../../utils/find-blocks';
import { Block } from '../block/block';
import { TextBlock } from '../block/text';

export type BlockType<T = any> = {
  id: string;
  type: string;
  data: T;
};

export const BlockMap = {
  paragraph: TextBlock,
};

export interface EditorProps {
  data?: BlockType[];
  defaultData?: BlockType[];
  children?: ReactNode;
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

export function useEditor() {
  const update = useUpdateAtom(blocksAtom);

  const insertBlock = ({
    index,
    block,
  }: {
    index?: number;
    block: any;
  }) => {
    let newBlock = {
      ...block,
      id: v4()
    }
    if (typeof index === 'undefined') {
      update((s) => {
        const result = [
          ...s,
          newBlock,
        ];
        return result;
      });
    } else {
      update((s) => insert(s, index, newBlock));
    }
  };

  const updateBlockDataWithId = ({
    id,
    data,
  }: {
    id: string;
    data: any;
  }) => {
    update((s) => s.map((b) => (b.id === id ? { ...b, data } : b)));
  };

  const removeBlockWithId = ({ id }: { id: string }) => {
    update((s) => s.filter((b) => b.id !== id));
  };

  return {
    insertBlock,
    updateBlockDataWithId,
    removeBlockWithId,
  };
}

function Elliot(props: { children?: ReactNode }) {
  const [id] = useAtom(editorIdAtom);
  const ref = useRef<HTMLDivElement>(null);
  const [blocks, setBlocks] = useAtom(blocksAtom);
  const active = useActiveBlockId();
  const [isSelectAll, setIsSelectAll] = useAtom(isSelectAllAtom);

  const handleClick = (e: MouseEvent) => {
    if (isSelectAll) {
      setIsSelectAll(false);
    }
    if (!active) {
      const lastBlock = findLastBlock();
      if (lastBlock) {
        const activeBlocks = blocks.find(
          (b) => b.id === lastBlock.blockId,
        );
        if (activeBlocks && activeBlocks.data) {
          setBlocks((s) => [
            ...s,
            { id: v4(), type: 'paragraph', data: '' },
          ]);
          lastBlock.editable.focus();
        } else {
          lastBlock.editable.focus();
        }
      }
    } else {
      // @ts-ignore
      active?.querySelector('[contenteditable]')?.focus();
    }
  };

  useEffect(() => {
    const handler = (e: CustomEvent) => {
      if (e.detail?.index >= 0) {
        const block = findBlockByIndex(e.detail.index);
        if (block) {
          block.editable.focus();
          requestAnimationFrame(() => {
            lastCursor();
          });
        }
      }
    };
    ref.current?.addEventListener('focus-block', handler);
    return () => {
      ref.current?.removeEventListener('focus-block', handler);
    };
  }, []);

  const onDragEndHandler = (result: DropResult) => {
    const { destination, source } = result;

    if (!destination || destination.index === source.index) {
      return;
    }

    const newBlocks = [...blocks];
    const dragBlock = newBlocks.splice(source.index, 1);
    newBlocks.splice(destination.index, 0, dragBlock[0]);
    setBlocks(newBlocks);
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
                setBlocks([
                  {
                    type: 'paragraph',
                    data: '',
                    id: v4(),
                  },
                ]);
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
            {blocks.map((b, i) => (
              <Block index={i} key={b.id} block={b} />
            ))}
          </Wrapper>
        )}
      </Droppable>
    </DragDropContext>
  );
}

export const Editor = (props: EditorProps) => {
  return (
    <Provider
      // @ts-ignore
      initialValues={[
        [blocksAtom, props.data || []],
        [editorIdAtom, v4()],
        [blockMapAtom, BlockMap],
      ]}
    >
      <Elliot>{props.children}</Elliot>
    </Provider>
  );
};
