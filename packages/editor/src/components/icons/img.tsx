import * as React from "react";

function SvgImg({ title, titleId, ...props }, svgRef) {
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
        d="M11.27 12.216L15 6l8 15H2L9 8l2.27 4.216zm1.12 2.022L14.987 19h4.68l-4.77-8.942-2.507 4.18zM5.348 19h7.304L9 12.219 5.348 19z"
        fill="currentColor"
      />
      <circle cx={4.5} cy={5.5} r={1.5} fill="currentColor" />
    </svg>
  );
}

const ForwardRef = React.forwardRef(SvgImg);
export default ForwardRef;
