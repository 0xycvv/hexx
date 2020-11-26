import clsx from 'clsx';
import { forwardRef } from 'react';
import { css } from 'src/stitches.config';
import { ContentEditableProps } from '../contenteditable';

const styles = css({
  maxWidth: '100%',
  width: '100%',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  caretColor: 'rgb(55, 53, 47)',
  padding: '3px 2px',
  ':focus': {
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
    <div
      dangerouslySetInnerHTML={{ __html: props.html }}
      contentEditable
      placeholder="Type something..."
      className={clsx('e-editable', styles.toString())}
      ref={ref}
      {...props}
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
