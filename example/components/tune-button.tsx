import { useEditor } from '@elliot/editor';
import {
  PortalPopper,
  useReactPopper,
} from '@elliot/editor/components';
import { styled } from '@elliot/theme';
import { forwardRef, useEffect } from 'react';
import { usePrevious, usePreviousExistValue } from './hooks';

const Tune = styled('div', {
  userSelect: 'none',
  cursor: 'pointer',
  borderRadius: '26px 26px 26px 0',
  fontSize: 24,
  display: 'flex',
  padding: '14px',
  border: '1px solid #D3D6D8',
  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.06)',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'black',
});

export const TuneButton = forwardRef((props: any, ref) => {
  const popper = useReactPopper({
    defaultActive: false,
    placement: 'right-start',
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [-26, 16],
        },
      },
    ],
  });

  const {
    hoverBlock,
    blockMap,
    insertBlockAfter,
    selectBlock,
    blockSelect,
    findBlockIndexById,
    removeBlockWithId,
  } = useEditor();
  const previousHoverBlockId = usePrevious(hoverBlock?.id);
  const hoverId = usePreviousExistValue(hoverBlock?.id);

  useEffect(() => {
    if (previousHoverBlockId !== hoverBlock?.id) {
      popper.setReferenceElement(hoverBlock?.el);
      if (hoverBlock) {
        popper.setActive(true);
      }
    }
  }, [hoverBlock, previousHoverBlockId]);

  const isSelecting = blockSelect === findBlockIndexById(hoverId);

  return (
    <PortalPopper popper={popper}>
      <Tune
        ref={ref as any}
        {...props}
        onClick={(e) => {
          if (isSelecting) {
            removeBlockWithId({ id: hoverId });
            selectBlock(null);
            popper.setActive(false);
          } else {
            selectBlock(hoverId);
          }

          e.preventDefault();
          e.stopPropagation();
        }}
      >
        {isSelecting ? (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M17 6H22V8H20V21C20 21.2652 19.8946 21.5196 19.7071 21.7071C19.5196 21.8946 19.2652 22 19 22H5C4.73478 22 4.48043 21.8946 4.29289 21.7071C4.10536 21.5196 4 21.2652 4 21V8H2V6H7V3C7 2.73478 7.10536 2.48043 7.29289 2.29289C7.48043 2.10536 7.73478 2 8 2H16C16.2652 2 16.5196 2.10536 16.7071 2.29289C16.8946 2.48043 17 2.73478 17 3V6ZM18 8H6V20H18V8ZM9 11H11V17H9V11ZM13 11H15V17H13V11ZM9 4V6H15V4H9Z"
              fill="#191919"
            />
          </svg>
        ) : (
          <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <path
              d="M12 1l9.5 5.5v11L12 23l-9.5-5.5v-11L12 1zm0 2.311L4.5 7.653v8.694l7.5 4.342 7.5-4.342V7.653L12 3.311zM12 16a4 4 0 110-8 4 4 0 010 8zm0-2a2 2 0 100-4 2 2 0 000 4z"
              fill="#000"
            />
          </svg>
        )}
      </Tune>
    </PortalPopper>
  );
});
