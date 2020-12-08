import { surround } from '../../../utils/find-blocks';
import SvgMarker from '../../icons/marker';
import { getSelectionRange } from '../../../utils/ranges';
import { useEventChangeSelection, useInlineTool } from '../hooks';
import { IconWrapper } from '../inline-toolbar';

const DEFAULT_HIGHLIGHT = 'rgba(228, 178, 2, 0.18)';

export function InlineMarker({
  highlightColor = DEFAULT_HIGHLIGHT,
}: {
  highlightColor?: string;
}) {
  const { getProps, setIsActive } = useInlineTool({
    onToggle: (isActive) => {
      if (isActive) {
        document.execCommand('removeFormat');
      } else {
        // https://dvcs.w3.org/hg/editing/raw-file/tip/editing.html#the-removeformat-command
        // `removeFormat` for `mark` should be supported?
        surround('span', {
          backgroundColor: 'rgba(228, 178, 2, 0.18)',
        });
        setIsActive(true);
      }
    },
  });

  useEventChangeSelection(() => {
    const r = getSelectionRange();
    const parentStart = r?.startContainer?.parentElement;
    const parentEnd = r?.endContainer?.parentElement;
    if (
      (parentStart?.tagName === 'SPAN' ||
        parentEnd?.tagName === 'SPAN') &&
      (parentEnd?.style.backgroundColor === highlightColor ||
        parentStart?.style.backgroundColor === highlightColor)
    ) {
      setIsActive(true);
    } else {
      setIsActive(false);
    }
  });

  return (
    <IconWrapper {...getProps}>
      <SvgMarker title="marker" />
    </IconWrapper>
  );
}
