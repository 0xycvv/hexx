import * as React from "react";

function SvgText({ title, titleId, ...props }, svgRef) {
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
      <path d="M13 6v15h-2V6H5V4h14v2h-6z" fill="currentColor" />
    </svg>
  );
}

const ForwardRef = React.forwardRef(SvgText);
export default ForwardRef;
