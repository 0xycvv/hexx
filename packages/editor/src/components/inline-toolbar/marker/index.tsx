import { surround } from '../../../utils/find-blocks';
import SvgMarker from '../../icons/marker';
import { getSelectionRange } from '../../../utils/ranges';
import { useEventChangeSelection, useInlineTool } from '../hooks';
import { IconWrapper } from '../inline-toolbar';

export function Unstable_InlineMarker() {
  const { getProps, isActive, setIsActive } = useInlineTool();

  useEventChangeSelection(() => {
    const r = getSelectionRange();
    if (
      // @ts-ignore
      r?.startContainer?.parentNode?.tagName === 'MARK' ||
      // @ts-ignore
      r?.endContainer?.parentNode?.tagName === 'MARK'
    ) {
      setIsActive(true);
    } else {
      setIsActive(false);
    }
  });

  return (
    <IconWrapper
      {...getProps}
      onClick={() => {
        if (isActive) {
          // TODO: remove mark or add mark
        } else {
          surround('mark');
          setIsActive(true);
        }
      }}
    >
      <SvgMarker />
    </IconWrapper>
  );
}
