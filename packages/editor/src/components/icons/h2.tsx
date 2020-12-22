import * as React from "react";

function SvgH2({ title, titleId, ...props }, svgRef) {
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
        d="M11 20h2V4h-2v7H4V4H2v16h2v-7h7v7zm9.137-6.86c-.32.437-.859 1.04-1.616 1.808l-3.392 3.408v1.6h7.648v-1.808h-5.072l2.624-2.672c.8-.821 1.35-1.493 1.648-2.016a3.273 3.273 0 00.448-1.648c0-1.024-.352-1.83-1.056-2.416a3.692 3.692 0 00-2.464-.896c-.928 0-1.69.187-2.288.56-.587.373-1.126.928-1.616 1.664l1.52.88c.608-.939 1.37-1.408 2.288-1.408.522 0 .954.16 1.296.48.341.31.512.688.512 1.136 0 .448-.16.89-.48 1.328z"
        fill="currentColor"
      />
    </svg>
  );
}

const ForwardRef = React.forwardRef(SvgH2);
export default ForwardRef;
