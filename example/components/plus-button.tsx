import { useEditor } from '@hexx/editor';
import {
  PortalPopper,
  useReactPopper,
} from '@hexx/editor/components';
import { styled } from '@hexx/theme';
import { createElement, Fragment, useEffect } from 'react';

const Plus = styled('div', {
  userSelect: 'none',
  cursor: 'pointer',
  fontSize: 24,
  display: 'flex',
  alignItems: 'center',
  padding: '14px',
  justifyContent: 'center',
  pointerEvents: 'auto',
  border: '1px solid #D3D6D8',
  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.06)',
  borderRadius: '26px 26px 0 26px',
  variants: {
    color: {
      active: {
        color: '$success',
      },
      inactive: {
        color: '$text',
      },
    },
  },
});

const AddMenu = styled('div', {
  backgroundColor: '#fff',
  borderRadius: '26px 26px 26px 0',
  fontSize: '24px',
  paddingLeft: '18px',
  paddingRight: '18px',
  paddingTop: '14px',
  paddingBottom: '14px',
  color: 'black',
  border: '1px solid #D3D6D8',
  display: 'grid',
  gridAutoFlow: 'column',
  gridTemplateRows: 'repeat(auto-fill)',
  svg: {
    cursor: 'pointer',
    paddingLeft: 6,
    paddingRight: 6,
    boxSizing: 'content-box',
    ':hover': {
      color: '$gay500',
    },
    '&.active': {
      color: '$success',
    },
  },
});

export function PlusButton() {
  const {
    hoverBlock,
    blockMap,
    insertBlockAfter,
    lastHoverBlock,
  } = useEditor();
  const popper = useReactPopper({
    defaultActive: false,
    placement: 'left-start',
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [-26, 16],
        },
      },
    ],
  });
  const menuPopper = useReactPopper({
    placement: 'right',
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [0, 16],
        },
      },
    ],
  });

  useEffect(() => {
    popper.setReferenceElement(hoverBlock?.el);
    if (hoverBlock) {
      popper.setActive(true);
    } else {
      popper.setActive(false);
    }
  }, [hoverBlock]);

  return (
    <>
      <PortalPopper popper={popper}>
        <Plus
          color={menuPopper.active ? 'active' : 'inactive'}
          ref={menuPopper.setReferenceElement}
          onClick={(e) => {
            menuPopper.setActive(true);
            e.stopPropagation();
          }}
        >
          <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <path
              d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"
              fill="currentColor"
            />
          </svg>
        </Plus>
      </PortalPopper>
      <PortalPopper popper={menuPopper}>
        <AddMenu
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
        >
          {Object.entries(blockMap).map(([key, blockType]) => (
            <Fragment key={key}>
              {createElement(blockType.block.icon.svg, {
                onClick: (e: MouseEvent) => {
                  insertBlockAfter({
                    block: {
                      type: blockType.block.type,
                      data: blockType.block.defaultValue,
                    },
                    id: lastHoverBlock.id,
                  });
                  menuPopper.setActive(false);
                  e.preventDefault();
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
