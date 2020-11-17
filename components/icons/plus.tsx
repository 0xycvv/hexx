import * as React from "react";

function SvgPlus({ title, titleId, ...props }, svgRef) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 50 50"
      ref={svgRef}
      aria-labelledby={titleId}
      {...props}
    >
      {title ? <title id={titleId}>{title}</title> : null}
      <path
        fill="#61B3C4"
        d="M39 7H11c-2.25 0-4 1.75-4 4v28c0 2.25 1.75 4 4 4h28c2.25 0 4-1.75 4-4V11c0-2.25-1.75-4-4-4z"
      />
      <path fill="#FFF" d="M35 27h-8v8h-4v-8h-8v-4h8v-8h4v8h8v4z" />
    </svg>
  );
}

const ForwardRef = React.forwardRef(SvgPlus);
export default ForwardRef;
