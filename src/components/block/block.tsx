import clsx from 'clsx';
import { useAtom } from 'jotai';
import { useSelector, useUpdateAtom } from 'jotai/utils.cjs';
import {
  createElement,
  forwardRef,
  Fragment,
  MouseEvent,
  useRef,
} from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { styled } from 'src/stitches.config';
import {
  blockMapAtom,
  blocksAtom,
  editorIdAtom,
  isSelectAllAtom,
} from '../../constants/atom';
import { BlockType, useEditor } from '../editor';
import DragIndicator from '../icons/drag-indicator';
import PlusSvg from '../icons/plus';
import { useReactPopper } from '../virtual-popper/use-virtual-popper';
import { PortalPopper } from '../virtual-popper/virtual-popper';

const Menu = styled('div', {
  opacity: 0,
});

const Wrapper = styled('div', {
  width: '100%',
  position: 'relative',
  marginTop: '1px',
  marginBottom: '1px',
  [`:hover ${Menu}`]: {
    opacity: 1,
    transition: 'opacity 20ms ease-in 0s',
  },
});

const Plus = styled('div', {
  userSelect: 'none',
  cursor: 'pointer',
  fontSize: 24,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'rgba(55, 53, 47, 0.3)',
  position: 'absolute',
  top: 3,
  left: '-24px',
  width: 24,
  height: 24,
  borderRadius: 3,
  pointerEvents: 'auto',
});

const Drag = styled('div', {
  userSelect: 'none',
  position: 'absolute',
  top: 3,
  right: '-24px',
  pointerEvents: 'auto',
  cursor: '-webkit-grab',
  borderRadius: 3,
  fontSize: 24,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'rgba(55, 53, 47, 0.3)',
});

const SelectOverlay = styled('div', {
  position: 'absolute',
  pointerEvents: 'none',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(46, 170, 220, 0.2)',
  zIndex: 81,
  opacity: 1,
});

function useBlock({
  block: defaultBlock,
  index,
}: {
  block: BlockType;
  index: number;
}) {
  const [blocksMap] = useAtom(blockMapAtom);
  const [editorId] = useAtom(editorIdAtom);
  const block = useSelector(
    blocksAtom,
    (v) => defaultBlock && v.find((b) => b.id === defaultBlock.id),
  );
  const update = useUpdateAtom(blocksAtom);
  const [isSelectAll, setIsSelectAll] = useAtom(isSelectAllAtom);
  const ref = useRef<HTMLDivElement>(null);
  const focusBlock = (index: number) => {
    const event = new CustomEvent('focus-block', {
      detail: {
        index,
      },
      bubbles: true,
    });
    ref.current.dispatchEvent(event);
  };

  return {
    editorId,
    blockComponent: blocksMap[block.type],
    getBlockProps: () => ({
      'data-block-id': block.id,
      className: clsx('e-block'),
    }),
    isSelectAll,
  };
}

export function Block({
  block,
  index,
}: {
  block: BlockType;
  index: number;
}) {
  const { getBlockProps, isSelectAll, blockComponent } = useBlock({
    block,
    index,
  });

  return (
    <Draggable draggableId={block.id} index={index}>
      {(provided) => (
        <Wrapper
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...getBlockProps()}
        >
          <Menu>
            <DragButton {...provided.dragHandleProps} />
            <PlusButton index={index} />
          </Menu>
          {createElement(blockComponent, {
            block,
            index,
          })}
          {isSelectAll && <SelectOverlay />}
        </Wrapper>
      )}
    </Draggable>
  );
}

const DragButton = forwardRef((props, ref) => {
  return (
    <Drag ref={ref as any} {...props}>
      <DragIndicator />
    </Drag>
  );
});

const AddMenu = styled('div', {
  background: 'black',
  borderRadius: 4,
  display: 'flex',
  fontSize: '18px',
  padding: 6,
  color: 'white',
  svg: {
    cursor: 'pointer',
  },
});

function PlusButton({
  onClick,
  index,
}: {
  onClick?: () => void;
  index: number;
}) {
  const [blocksMap] = useAtom(blockMapAtom);
  const popper = useReactPopper({
    placement: 'right',
  });
  const { insertBlock } = useEditor();

  return (
    <>
      <Plus
        ref={popper.setReferenceElement}
        onClick={(e) => {
          popper.setActive(true);
          onClick?.();
          e.stopPropagation();
        }}
      >
        <PlusSvg />
      </Plus>
      <PortalPopper popper={popper}>
        <AddMenu>
          {Object.entries(blocksMap).map(([key, blockType]) => (
            <Fragment key={key}>
              {createElement(blockType.icon.svg, {
                onClick: (e: MouseEvent) => {
                  insertBlock({
                    block: blockType.defaultValue,
                    index: index + 1,
                  });
                  popper.setActive(false);
                  e.stopPropagation();
                },
              })}
            </Fragment>
          ))}
        </AddMenu>
      </PortalPopper>
    </>
  );
}
