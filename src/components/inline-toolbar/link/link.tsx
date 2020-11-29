import { useAtom } from 'jotai';
import { useRef, useState } from 'react';
import Link from '../../icons/link';
import { activeBlockIdAtom } from '../../../constants/atom';
import {
  findContentEditable,
  surround,
} from '../../../utils/find-blocks';
import { saveSelection } from '../../../utils/remove-ranges';
import {
  generateGetBoundingClientRect,
  getRectFromTextNode,
} from '../../../utils/virtual-element';
import { useReactPopper } from '../../virtual-popper/use-virtual-popper';
import { PortalPopper } from '../../virtual-popper/virtual-popper';
import { useEventChangeSelection, useInlineTool } from '../hooks';
import { IconWrapper } from '../inline-toolbar';
import { styled } from 'src/stitches.config';

const LinkWrapper = styled('div', {
  boxShadow: `rgba(15, 15, 15, 0.05) 0px 0px 0px 1px,
  rgba(15, 15, 15, 0.1) 0px 3px 6px,
  rgba(15, 15, 15, 0.2) 0px 9px 24px`,
  overflow: 'hidden',
  backgroundColor: 'white',
});

const InputWrapper = styled('div', {
  paddingTop: 6,
  paddingBottom: 6,
  marginTop: 8,
  marginBottom: 8,
  marginLeft: 14,
  marginRight: 14,
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
  const [hasChanged, setHasChanged] = useState(false);
  const popper = useReactPopper({ placement: 'bottom' });
  const selectionWrapper = useRef<HTMLSpanElement>();
  const { getProps, setIsActive } = useInlineTool({
    type: 'link',
    onClick: () => {
      const editable = activeBlock.editable;
      editableSnap.current = editable;
      snapHTML.current = editable.innerHTML;
      const selRange = saveSelection();
      selectionWrapper.current = highlight(selRange);
      popper.setActive((s) => !s);
      const rect = getRectFromTextNode();
      popper.setReferenceElement({
        getBoundingClientRect: generateGetBoundingClientRect(rect),
      });
    },
  });

  useEventChangeSelection(setIsActive);

  return (
    <>
      <IconWrapper {...getProps()}>
        <Link />
      </IconWrapper>
      <PortalPopper
        onClose={() => {
          if (!hasChanged) {
            editableSnap.current.innerHTML = snapHTML.current;
          }
        }}
        popper={popper}
        pointerEvent="auto"
      >
        <LinkInput
          onClose={(value) => {
            const selection = window.getSelection();
            const r = document.createRange();
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
            }, 0);
          }}
        />
      </PortalPopper>
    </>
  );
}

function LinkInput(props: { onClose: (value: string) => void }) {
  const ref = useRef<HTMLInputElement>();
  return (
    <>
      <LinkWrapper>
        <InputWrapper>
          <input
            onFocus={() => {}}
            autoFocus
            ref={ref}
            type="url"
            placeholder="enter your url"
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.stopPropagation();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                props.onClose(ref.current.value);

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
