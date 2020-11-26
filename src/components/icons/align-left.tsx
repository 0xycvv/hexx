import * as React from "react";

function SvgAlignLeft({ title, titleId, ...props }, svgRef) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      ref={svgRef}
      aria-labelledby={titleId}
      {...props}
    >
      {title ? <title id={titleId}>{title}</title> : null}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3 5V3h18v2H3zm12 2H3v2h12V7zm0 8H3v2h12v-2zm6-2H3v-2h18v2zM3 21h18v-2H3v2z"
        fill="currentColor"
      />
    </svg>
  );
}

const ForwardRef = React.forwardRef(SvgAlignLeft);
export default ForwardRef;
