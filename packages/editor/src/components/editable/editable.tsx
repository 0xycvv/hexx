import { css, CSS } from '@hexx/theme';
import { forwardRef } from 'react';
import {
  ContentEditable,
  ContentEditableProps,
} from '../contenteditable';

const styles = {
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
} as const;

export const Editable = forwardRef<
  any,
  ContentEditableProps & {
    css?: CSS;
  }
>(({ html = '', css: overrideCss, ...props }, ref) => {
  const combineStyles = css({ ...styles, ...(overrideCss as any) });

  return (
    <ContentEditable
      {...props}
      html={html}
      placeholder={props.placeholder || 'Type something...'}
      className={`hexx-editable ${
        props.className || ''
      } ${combineStyles()}`}
      ref={ref as any}
    />
  );
});
