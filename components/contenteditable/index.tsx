import React, { forwardRef } from 'react';
import ReactContentEditable, { Props } from 'react-contenteditable';

export type ContentEditableProps = Props;
export const ContentEditable = forwardRef<
  HTMLElement,
  Props
>(
  (
    { onChange, onInput, onBlur, onKeyPress, onKeyDown, ...props },
    ref,
  ) => {
    const onChangeRef = React.useRef(onChange);
    const onInputRef = React.useRef(onInput);
    const onBlurRef = React.useRef(onBlur);
    const onKeyPressRef = React.useRef(onKeyPress);
    const onKeyDownRef = React.useRef(onKeyDown);

    React.useEffect(() => {
      onChangeRef.current = onChange;
    }, [onChange]);
    React.useEffect(() => {
      onInputRef.current = onInput;
    }, [onInput]);
    React.useEffect(() => {
      onBlurRef.current = onBlur;
    }, [onBlur]);
    React.useEffect(() => {
      onKeyPressRef.current = onKeyPress;
    }, [onKeyPress]);
    React.useEffect(() => {
      onKeyDownRef.current = onKeyDown;
    }, [onKeyDown]);

    return (
      // @ts-ignore
      <ReactContentEditable
        {...props}
        innerRef={ref}
        onChange={
          onChange
            ? (...args) => {
                if (onChangeRef.current) {
                  onChangeRef.current(...args);
                }
              }
            : undefined
        }
        onInput={
          onInput
            ? (...args) => {
                if (onInputRef.current) {
                  onInputRef.current(...args);
                }
              }
            : undefined
        }
        onBlur={
          onBlur
            ? (...args) => {
                if (onBlurRef.current) {
                  onBlurRef.current(...args);
                }
              }
            : undefined
        }
        onKeyPress={
          onKeyPress
            ? (...args) => {
                if (onKeyPressRef.current) {
                  onKeyPressRef.current(...args);
                }
              }
            : undefined
        }
        onKeyDown={
          onKeyDown
            ? (...args) => {
                if (onKeyDownRef.current) {
                  onKeyDownRef.current(...args);
                }
              }
            : undefined
        }
      />
    );
  },
);
