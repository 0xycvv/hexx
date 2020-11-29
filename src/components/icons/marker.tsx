import * as React from "react";

function SvgMarker({ title, titleId, ...props }, svgRef) {
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
        d="M15.242 4.515l-6.738 6.737-.707 2.121-1.04 1.041 2.828 2.83 1.04-1.042 2.122-.707 6.737-6.738-4.242-4.242zm6.364 3.535a1 1 0 010 1.414l-7.779 7.78-2.12.706-1.415 1.414a1 1 0 01-1.414 0l-4.243-4.243a1 1 0 010-1.414l1.414-1.414.707-2.12 7.78-7.78a1 1 0 011.413 0l5.657 5.657zm-6.364-.707l1.414 1.414-4.95 4.95-1.414-1.414 4.95-4.95zM4.282 16.89l2.828 2.83-1.414 1.413-4.243-1.414 2.828-2.829h.001z"
        fill="currentColor"
      />
    </svg>
  );
}

const ForwardRef = React.forwardRef(SvgMarker);
export default ForwardRef;
