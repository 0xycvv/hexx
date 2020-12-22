import * as React from 'react';

function SvgCode({ title, titleId, ...props }, svgRef) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      {...props}
    >
      <path
        d="M8 21v-2h3V5H8V3h8v2h-3v14h3v2H8zM18.55 7.05L23.5 12l-4.95 4.95-1.414-1.414L20.672 12l-3.536-3.536L18.55 7.05zm-12.928 0l1.414 1.414L3.5 12l3.536 3.536-1.414 1.414L.672 12l4.95-4.95z"
        fill="currentColor"
      />
    </svg>
  );
}

const ForwardRef = React.forwardRef(SvgCode);
export default ForwardRef;
