import { css } from '@hexx/theme';
import { forwardRef } from 'react';
import {
  ContentEditable,
  ContentEditableProps,
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
  ({ html = '', onChange,...props }, ref) => (
    <ContentEditable
      {...props}
      html={html}
      placeholder={props.placeholder || 'Type something...'}
      className={`e-editable ${props.className || ''} ${styles}`}
      ref={ref as any}
    />
  ),
);
