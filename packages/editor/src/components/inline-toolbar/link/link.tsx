import { StitchesProps, styled } from '@hexx/theme';
import { useAtom } from 'jotai';
import { useEffect, useRef, useState } from 'react';
import {
  ActiveBlock,
  activeBlockAtom,
} from '../../../constants/atom';
import { getSelectionRange } from '../../../utils/ranges';
import Link from '../../icons/link';
import { Popper } from '../../popper/portal-popper';
import { useReactPopper } from '../../popper/use-react-popper';
import {
  isAnchorElement,
  useEventChangeSelection,
  useInlineTool,
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
  el.classList.add('hexx-link-target');
  el.style.backgroundColor = 'rgba(45, 170, 219, 0.3)';
  r.surroundContents(el);
  return el;
}

export function InlineLink(props: StitchesProps<typeof IconWrapper>) {
  const [activeBlock] = useAtom(activeBlockAtom);
  const [initialValue, setInitialValue] = useState('');
  const [
    currentActiveBlock,
    setCurrentActiveBlock,
  ] = useState<ActiveBlock | null>(null);
  const snapHTML = useRef<string>();
  const editableSnap = useRef<HTMLDivElement>();
  const [hasChanged, setHasChanged] = useState(false);
  const popper = useReactPopper({
    onClose: () => {
      if (!hasChanged && snapHTML.current && editableSnap.current) {
        editableSnap.current.innerHTML = snapHTML.current;
        editableSnap.current.focus();
        document.execCommand('removeFormat');
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
  const { getProps, setIsActive } = useInlineTool({
    shortcut: '⌘ + k',
    onToggle: (isActive) => {
      const selRange = getSelectionRange();
      const editable = activeBlock?.editable;
      if (!editable) {
        return;
      }
      setCurrentActiveBlock(activeBlock);
      editableSnap.current = editable;
      snapHTML.current = editable?.innerHTML;
      if (!selRange) return;
      selectionWrapper.current = highlight(selRange);
      document.execCommand('formatBlock', false, 'p');
      requestAnimationFrame(() => {
        popper.setActive((s) => !s);
      });
    },
  });

  useEventChangeSelection(() => {
    const [isAnchor, url] = isAnchorElement();
    setIsActive(isAnchor);
    setInitialValue(url || '');
  });

  return (
    <>
      <IconWrapper
        ref={popper.setReferenceElement}
        {...getProps}
        {...props}
      >
        <Link title="link" />
        <Popper popper={popper} pointerEvent="auto">
          <LinkInput
            defaultValue={initialValue}
            onClose={(value) => {
              const selection = window.getSelection();
              const r = document.createRange().cloneRange();
              if (!selectionWrapper.current || !r || !selection) {
                return;
              }
              // @ts-ignore
              const target = currentActiveBlock?.blockEl?.querySelector(
                '.hexx-link-target',
              );
              if (!target) return;
              r.selectNodeContents(target);
              selection.removeAllRanges();
              selection.addRange(r);
              setHasChanged(true);
              document.execCommand('removeFormat');
              target.classList.remove('hexx-link-target');
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
                popper.setActive(false);
                setIsActive(false);
              }
            }}
          />
        </Popper>
      </IconWrapper>
    </>
  );
}

const LinkInput = (props) => {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  return (
    <LinkWrapper>
      <InputWrapper>
        <Input
          ref={ref}
          defaultValue={props.defaultValue}
          autoFocus
          type="url"
          pattern="https?://.+"
          placeholder="Paste link or type to search"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              props.onClose(ref?.current?.value);
              e.preventDefault();
              e.stopPropagation();
            }
          }}
        />
      </InputWrapper>
    </LinkWrapper>
  );
};
