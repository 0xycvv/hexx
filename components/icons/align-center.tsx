import * as React from "react";

function SvgAlignCenter({ title, titleId, ...props }, svgRef) {
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
        d="M3 5V3h18v2H3zm4 2v2h10V7H7zm14 6H3v-2h18v2zM7 15v2h10v-2H7zm-4 6h18v-2H3v2z"
        fill="currentColor"
      />
    </svg>
  );
}

const ForwardRef = React.forwardRef(SvgAlignCenter);
export default ForwardRef;
