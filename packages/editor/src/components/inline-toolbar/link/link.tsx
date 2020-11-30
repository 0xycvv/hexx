import { useAtom } from 'jotai';
import { useRef, useState } from 'react';
import { styled } from '@elliot/theme';
import { activeBlockIdAtom } from '../../../constants/atom';
import { surround } from '../../../utils/find-blocks';
import { saveSelection } from '../../../utils/ranges';
import Link from '../../icons/link';
import { useReactPopper } from '../../virtual-popper/use-virtual-popper';
import { PortalPopper } from '../../virtual-popper/virtual-popper';
import { useEventChangeSelection, useInlineTool } from '../hooks';
import { IconWrapper } from '../inline-toolbar';
import { useBlock, useEditor } from 'src/hooks/use-editor';

const LinkWrapper = styled('div', {
  boxShadow: `0px 2px 4px rgba(0, 0, 0, 0.06)`,
  overflow: 'hidden',
  backgroundColor: 'white',
  border: '1px solid #E6E8E9',
  borderRadius: 4,
  p: 6,
});

const InputWrapper = styled('div', {
  paddingTop: 6,
  paddingBottom: 6,
  marginTop: 8,
  marginBottom: 8,
  marginLeft: 14,
  marginRight: 14,
  fontWeight: 500,
  fontSize: 14,
  lineHeight: '19px',
  letterSpacing: 0.1,
});

const Input = styled('input', {
  minWidth: '187px',
  border: 'none',
  '&::placeholder': {
    color: '#D3D6D8',
  },
  '&:focus': {
    outline: 'none',
  },
});

function highlight(r: Range | null) {
  if (!r) return;

  const el = document.createElement('span');
  el.style.borderRadius = '1px';
  el.style.background = 'rgba(45, 170, 219, 0.3)';
  el.style.boxShadow = '0 0 0 3px rgba(45, 170, 219, 0.3)';
  r.surroundContents(el);
  return el;
}

export function InlineLink() {
  const [activeBlock] = useAtom(activeBlockIdAtom);
  const snapHTML = useRef<string>();
  const editableSnap = useRef<HTMLDivElement>();
  const iconRef = useRef<HTMLDivElement>(null);
  const [hasChanged, setHasChanged] = useState(false);
  const popper = useReactPopper({
    onClose: () => {
      if (!hasChanged && snapHTML.current && editableSnap.current) {
        requestAnimationFrame(() => {
          editableSnap.current.innerHTML = snapHTML.current;
          document.execCommand('formatBlock', false, 'p');
        });
      }
    },
    placement: 'bottom',
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [0, 8],
        },
      },
    ],
  });
  const selectionWrapper = useRef<HTMLSpanElement>();
  const { getProps, setIsActive } = useInlineTool({
    type: 'link',
    onClick: () => {
      const editable = activeBlock.editable;
      editableSnap.current = editable;
      snapHTML.current = editable?.innerHTML;
      const selRange = saveSelection();
      selectionWrapper.current = highlight(selRange);
      popper.setActive((s) => !s);
    },
  });

  useEventChangeSelection(setIsActive);

  return (
    <>
      <IconWrapper ref={popper.setReferenceElement} {...getProps()}>
        <Link />
      </IconWrapper>
      <PortalPopper popper={popper} pointerEvent="auto">
        <LinkInput
          onClose={(value) => {
            const selection = window.getSelection();
            const r = document.createRange();
            if (!selectionWrapper.current || !selection) {
              return;
            }
            r.selectNodeContents(selectionWrapper.current);
            selection.removeAllRanges();
            selection.addRange(r);

            selectionWrapper.current.style.borderBottom =
              '0.05em solid';
            selectionWrapper.current.style.borderColor =
              'rgba(55,53,47,0.4)';
            selectionWrapper.current.style.opacity = '0.7';
            selectionWrapper.current.style.background = '';
            selectionWrapper.current.style.boxShadow = '';
            selectionWrapper.current.style.borderRadius = '';
            setHasChanged(true);
            surround('createLink', undefined, value);
            setTimeout(() => {
              if (selection.anchorNode?.parentElement) {
                selection.anchorNode.parentElement.setAttribute(
                  'target',
                  '_blank',
                );
                selection.anchorNode.parentElement.setAttribute(
                  'rel',
                  'noopener noreferrer',
                );
                popper.setActive(false);
                setIsActive(false);
              }
            }, 0);
          }}
        />
      </PortalPopper>
    </>
  );
}

function LinkInput(props: { onClose: (value?: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <>
      <LinkWrapper>
        <InputWrapper>
          <Input
            autoFocus
            ref={ref}
            type="url"
            placeholder="Paste link or type to search"
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.stopPropagation();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                props.onClose(ref.current?.value);

                e.preventDefault();
                e.stopPropagation();
              }
            }}
          />
        </InputWrapper>
      </LinkWrapper>
    </>
  );
}
