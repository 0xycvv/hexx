import * as React from "react";

function SvgUnderlined({ title, titleId, ...props }, svgRef) {
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
        d="M18 11c0 3.31-2.69 6-6 6s-6-2.69-6-6V3h2.5v8c0 1.93 1.57 3.5 3.5 3.5s3.5-1.57 3.5-3.5V3H18v8zM5 21v-2h14v2H5z"
        fill="currentColor"
      />
    </svg>
  );
}

const ForwardRef = React.forwardRef(SvgUnderlined);
export default ForwardRef;
