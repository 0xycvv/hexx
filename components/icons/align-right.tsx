import * as React from "react";

function SvgAlignRight({ title, titleId, ...props }, svgRef) {
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
        d="M3 5V3h18v2H3zm6 4h12V7H9v2zm12 4H3v-2h18v2zM9 17h12v-2H9v2zm-6 4h18v-2H3v2z"
        fill="currentColor"
      />
    </svg>
  );
}

const ForwardRef = React.forwardRef(SvgAlignRight);
export default ForwardRef;
