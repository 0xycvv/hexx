import { useEditor, useIdMap } from '@hexx/editor';
import { styled } from '@hexx/theme';
import {
  PortalPopper,
  useReactPopper,
} from '@hexx/editor/components';
import { forwardRef, useEffect } from 'react';

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
  backgroundColor: '$bg',
});

const Icon = styled('svg', {
  cursor: 'pointer',
  paddingLeft: 6,
  paddingRight: 6,
  boxSizing: 'content-box',
  ':hover': {
    color: '$gray500',
  },
  variants: {
    color: {
      active: {
        color: '$success',
        ':hover': {
          color: '$success',
        },
      },
      inactive: {
        color: '$text',
      },
    },
  },
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

  const [idMap] = useIdMap();

  const {
    hoverBlock,
    lastHoverBlock,
    blockMap,
    updateBlockDataWithId,
    selectBlock,
    blockSelect,
    removeBlockWithId,
  } = useEditor();

  useEffect(() => {
    if (hoverBlock?.el) {
      const target = hoverBlock.el.querySelector(
        '.hexx-right-indicator',
      );
      popper.setReferenceElement(target);
    }
    if (hoverBlock) {
      popper.setActive(true);
    } else {
      popper.setActive(false);
    }
  }, [hoverBlock]);

  const isSelecting = blockSelect.includes(lastHoverBlock?.id);
  const currentBlockData =
    lastHoverBlock?.id && idMap[lastHoverBlock.id];

  const tunes =
    currentBlockData?.type &&
    blockMap[currentBlockData.type]?.block?.tune;

  return (
    <PortalPopper popper={popper}>
      <Tune
        ref={ref as any}
        {...props}
        onClick={(e) => {
          if (!isSelecting) {
            selectBlock(lastHoverBlock?.id);
            popper.popperJs.update?.();
          }
        }}
      >
        {isSelecting ? (
          <>
            {tunes?.map((tune, i) => {
              return (
                <Icon
                  key={i}
                  title={tune.icon.text}
                  as={tune.icon.svg}
                  color={
                    tune.icon.isActive(currentBlockData.data)
                      ? 'active'
                      : 'inactive'
                  }
                  onClick={(e) => {
                    if (!lastHoverBlock?.id) return;
                    updateBlockDataWithId({
                      id: lastHoverBlock.id,
                      data: tune.updater(currentBlockData.data),
                    });
                    selectBlock(null);
                    popper.popperJs.update();
                    e.stopPropagation();
                  }}
                />
              );
            })}
            <svg
              onClick={() => {
                if (!lastHoverBlock?.id) return;
                removeBlockWithId({ id: lastHoverBlock.id });
                selectBlock(null);
                popper.setActive(false);
              }}
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
          </>
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
