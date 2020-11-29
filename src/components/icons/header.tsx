import * as React from "react";

function SvgHeader({ title, titleId, ...props }, svgRef) {
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
      <path d="M17 11V4h2v17h-2v-8H7v8H5V4h2v7h10z" fill="currentColor" />
    </svg>
  );
}

const ForwardRef = React.forwardRef(SvgHeader);
export default ForwardRef;
