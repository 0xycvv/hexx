import { forwardRef } from 'react';
import { css } from '@elliot/theme';
import {
  ContentEditableProps,
  ContentEditable,
} from '../contenteditable';

const styles = css({
  maxWidth: '100%',
  width: '100%',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  caretColor: 'rgb(55, 53, 47)',
  '&:focus': {
    outline: 'none',
  },
  '&[placeholder]:empty::before': {
    content: 'attr(placeholder)',
    minHeight: '1em',
    color: 'rgb(55, 53, 47)',
    WebkitTextFillColor: 'rgba(55, 53, 47, 0.4)',
  },
  '&[placeholder]:not(:empty)::before': {
    content: `""`,
  },
  '&[placeholder]:not(:focus)::before': {
    content: `""`,
  },
});
export const Editable = forwardRef<any, ContentEditableProps>(
  (props, ref) => (
    <ContentEditable
      {...props}
      placeholder={props.placeholder || 'Type something...'}
      className={`e-editable ${props.className || ''} ${styles}`}
      ref={ref as any}
    />
  ),
);

export const isEditableSelectAll = () => {
  const sel = getSelection();
  if (sel.type === 'Caret') {
    if (!sel.anchorOffset && sel.isCollapsed) {
      return true;
    }
    return false;
  }
  if (sel.type === 'Range') {
    if (!sel.anchorOffset) {
      return true;
    }
    return false;
  }
};
