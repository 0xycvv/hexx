import { StitchesProps, styled } from '@hexx/theme';
import { createElement, Fragment, useEffect } from 'react';
import { useEditor, useEventListener } from '../hooks';
import { usePlugin } from '../plugins';
import { isBlockEmpty } from '../utils/blocks';
import { BlockMenu } from './block-menu';
import { PortalPopper } from './popper/portal-popper';
import {
  useReactPopper,
  UseReactPopperProps,
} from './popper/use-react-popper';

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
  backgroundColor: '$bg',
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
      color: '$gray500',
    },
    '&.active': {
      color: '$success',
    },
  },
});

interface PlusButtonProps {
  popper?: UseReactPopperProps;
  menuPopper?: UseReactPopperProps;
  iconProps?: StitchesProps<typeof Plus>;
  menuProps?: StitchesProps<typeof AddMenu>;
}

function useTabMenu(onActive: () => void, id?: string) {
  const { wrapperRef } = usePlugin();
  const { getBlock, blockMap } = useEditor();
  useEventListener(
    'keydown',
    (e) => {
      if (e.key === 'Tab' && !e.shiftKey) {
        if (id) {
          getBlock({ id })
            .then((data) => {
              const isEmpty = isBlockEmpty(blockMap[data.type], data);
              if (isEmpty) {
                onActive();
              }
            })
            .catch((err) => console.log(err));
        }
      }
    },
    wrapperRef,
  );
}

export function PlusButton(props: PlusButtonProps) {
  const { hoverBlock } = useEditor();

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
    ...props.popper,
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
    ...props.menuPopper,
  });

  useTabMenu(() => {
    popper.setActive(true);
    menuPopper.setActive(true);
    console.log(menuPopper.popperElement);
    menuPopper.popperElement?.focus();
  }, hoverBlock?.id);

  useEffect(() => {
    popper.setReferenceElement(hoverBlock?.el);
    if (hoverBlock) {
      popper.setActive(true);
    } else {
      popper.setActive(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hoverBlock]);

  return (
    <>
      <PortalPopper popper={popper}>
        <Plus
          color={menuPopper.active ? 'active' : 'inactive'}
          {...props.iconProps}
          ref={menuPopper.setReferenceElement}
          onClick={() => {
            menuPopper.setActive(true);
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
        <AddMenu {...props.menuProps}>
          <BlockMenu onAdd={() => menuPopper.setActive(false)} />
        </AddMenu>
      </PortalPopper>
    </>
  );
}
