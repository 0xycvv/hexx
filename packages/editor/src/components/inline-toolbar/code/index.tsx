import { IconWrapper } from '../inline-toolbar';
import SvgCode from '../../icons/code';
import { useEventChangeSelection, useInlineTool } from '../hooks';
import { surround } from '../../../utils/find-blocks';
import { getSelectionRange } from '../../../utils/ranges';
import { ComponentProps } from 'react';
export function InlineCode(
  props: ComponentProps<typeof IconWrapper>,
) {
  const { getProps, setIsActive } = useInlineTool({
    shortcut: '⌘ + e',
    onToggle: (isActive) => {
      if (!isActive) {
        document.execCommand('removeFormat');
        setIsActive(false);
      } else {
        surround('code');
        document.execCommand('unlink'); // trigger onchange
        setIsActive(true);
      }
    },
  });

  useEventChangeSelection(() => {
    const r = getSelectionRange();
    if (
      // @ts-ignore
      r?.startContainer?.parentNode?.tagName === 'CODE' ||
      // @ts-ignore
      r?.endContainer?.parentNode?.tagName === 'CODE'
    ) {
      setIsActive(true);
    } else {
      setIsActive(false);
    }
  });

  return (
    <IconWrapper {...getProps} {...props}>
      <SvgCode title="code" />
    </IconWrapper>
  );
}
