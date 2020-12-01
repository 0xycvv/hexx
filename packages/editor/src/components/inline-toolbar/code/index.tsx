import { IconWrapper } from '../inline-toolbar';
import SvgCode from '../../icons/code';
import { useEventChangeSelection, useInlineTool } from '../hooks';
import { surround } from '../../../utils/find-blocks';
import { getSelectionRange } from '../../../utils/ranges';
export function InlineCode() {
  const { getProps, setIsActive, isActive } = useInlineTool({
    onClick: () => {
      if (isActive) {
        document.execCommand('removeFormat');
        setIsActive(false);
      } else {
        surround('code');
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
    <IconWrapper {...getProps()}>
      <SvgCode />
    </IconWrapper>
  );
}
