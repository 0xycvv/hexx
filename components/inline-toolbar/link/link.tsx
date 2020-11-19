import { useAtom } from 'jotai';
import { useRef, useState } from 'react';
import Link from '../../../components/icons/link';
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
import { useVirtualPopper } from '../../virtual-popper/use-virtual-popper';
import { VirtualPopper } from '../../virtual-popper/virtual-popper';
import { useEventChangeSelection, useInlineTool } from '../hooks';

function highlight(r: Range | null) {
  if (!r) return;

  const el = document.createElement('span');
  el.style.borderRadius = '1px';
  el.style.background = 'rgba(45, 170, 219, 0.3)';
  el.style.boxShadow = '0 0 0 3px rgba(45, 170, 219, 0.3)';
  r.surroundContents(el);
  return el;
}

function unwrap(wrapper) {
  // place childNodes in document fragment
  var docFrag = document.createDocumentFragment();
  while (wrapper.firstChild) {
    var child = wrapper.removeChild(wrapper.firstChild);
    docFrag.appendChild(child);
  }

  // replace wrapper with document fragment
  return wrapper;
}

export function InlineLink() {
  const [activeBlock] = useAtom(activeBlockIdAtom);
  const snapHTML = useRef<string>();
  const editableSnap = useRef<HTMLDivElement>();
  const [hasChanged, setHasChanged] = useState(false);
  const popper = useVirtualPopper({ placement: 'bottom-start' });
  const [range, setRange] = useState<Range>();
  const selectionWrapper = useRef<HTMLSpanElement>();
  const { getProps, setIsActive } = useInlineTool({
    type: 'link',
    onClick: () => {
      const editable = findContentEditable(
        activeBlock as HTMLElement,
      );
      editableSnap.current = editable;
      snapHTML.current = editable.innerHTML;
      const selRange = saveSelection();
      setRange(selRange);
      selectionWrapper.current = highlight(selRange);
      popper.setActive((s) => !s);
      const rect = getRectFromTextNode();
      popper.setReferenceElement({
        getBoundingClientRect: rect
          ? generateGetBoundingClientRect(rect.x, rect.bottom)
          : generateGetBoundingClientRect(),
      });
    },
  });

  const resetSelectionHTML = () => {
    const childNodes = selectionWrapper.current.childNodes;
    const r = document.createRange();
    console.log(childNodes);
    r.selectNodeContents(childNodes[0]);

    selectionWrapper.current.replaceWith(
      ...selectionWrapper.current.childNodes,
    );
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(r);
  };

  useEventChangeSelection(setIsActive);

  return (
    <>
      <div {...getProps()}>
        <Link />
      </div>
      <VirtualPopper
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
      </VirtualPopper>
    </>
  );
}

function LinkInput(props: { onClose: (value: string) => void }) {
  const ref = useRef<HTMLInputElement>();
  return (
    <>
      <div className="link-wrapper">
        <div className="input-wrapper">
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
        </div>
      </div>
      <style jsx>{`
        .link-wrapper {
          box-shadow: rgba(15, 15, 15, 0.05) 0px 0px 0px 1px,
            rgba(15, 15, 15, 0.1) 0px 3px 6px,
            rgba(15, 15, 15, 0.2) 0px 9px 24px;
          overflow: hidden;
          background-color: white;
        }
        .input-wrapper {
          padding-top: 6px;
          padding-bottom: 6px;
          margin-top: 8px;
          margin-bottom: 8px;
          margin-left: 14px;
          margin-right: 14px;
        }
      `}</style>
    </>
  );
}
