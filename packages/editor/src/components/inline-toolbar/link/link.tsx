import { useAtom } from 'jotai';
import { useRef, useState } from 'react';
import { StitchesProps, styled } from '@hexx/theme';
import { activeBlockIdAtom } from '../../../constants/atom';
import { saveSelection } from '../../../utils/ranges';
import Link from '../../icons/link';
import { useReactPopper } from '../../popper/use-react-popper';
import { PortalPopper } from '../../popper/portal-popper';
import {
  useEventChangeSelection,
  useInlineTool,
  isAnchorElement,
} from '../hooks';
import { IconWrapper } from '../inline-toolbar';

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

export function InlineLink(props: StitchesProps<typeof IconWrapper>) {
  const [activeBlock] = useAtom(activeBlockIdAtom);
  const [initialValue, setInitialValue] = useState('');
  const snapHTML = useRef<string>();
  const editableSnap = useRef<HTMLDivElement>();
  const [hasChanged, setHasChanged] = useState(false);
  const popper = useReactPopper({
    onClose: () => {
      if (!hasChanged && snapHTML.current && editableSnap.current) {
        editableSnap.current.innerHTML = snapHTML.current;
        editableSnap.current.focus();
        document.execCommand('formatBlock', false, 'p');
      }
    },
    placement: 'bottom',
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [0, 24],
        },
      },
    ],
  });
  const selectionWrapper = useRef<HTMLSpanElement>();
  const { getProps, setIsActive } = useInlineTool();

  useEventChangeSelection(() => {
    const [isAnchor, url] = isAnchorElement();
    setIsActive(isAnchor);
    setInitialValue(url || '');
  });

  return (
    <>
      <IconWrapper
        ref={popper.setReferenceElement}
        onClick={() => {
          const editable = activeBlock?.editable;
          if (!editable) {
            return;
          }
          editableSnap.current = editable;
          snapHTML.current = editable?.innerHTML;
          const selRange = saveSelection();
          if (!selRange) return;
          selectionWrapper.current = highlight(selRange);
          popper.setActive((s) => !s);
        }}
        {...getProps}
        {...props}
      >
        <Link title="link" />
      </IconWrapper>
      <PortalPopper popper={popper} pointerEvent="auto">
        <LinkInput
          defaultValue={initialValue}
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
            selectionWrapper.current.style.background = '';
            selectionWrapper.current.style.boxShadow = '';
            selectionWrapper.current.style.borderRadius = '';
            setHasChanged(true);
            document.execCommand('createLink', false, value);
            if (selection.anchorNode?.parentElement) {
              selection.anchorNode.parentElement.setAttribute(
                'target',
                '_blank',
              );
              selection.anchorNode.parentElement.setAttribute(
                'rel',
                'noopener noreferrer',
              );
              editableSnap.current?.focus();
              document.execCommand('removeFormat');
              popper.setActive(false);
              setIsActive(false);
            }
          }}
        />
      </PortalPopper>
    </>
  );
}

function LinkInput(props: {
  onClose: (value?: string) => void;
  defaultValue?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <>
      <LinkWrapper>
        <InputWrapper>
          <Input
            onFocus={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            defaultValue={props.defaultValue}
            autoFocus
            ref={ref}
            type="url"
            pattern="https?://.+"
            placeholder="Paste link or type to search"
            onMouseUp={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
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
