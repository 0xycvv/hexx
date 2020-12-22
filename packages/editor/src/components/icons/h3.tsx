import * as React from "react";

function SvgH3({ title, titleId, ...props }, svgRef) {
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
        d="M11 20h2V4h-2v7H4V4H2v16h2v-7h7v7zm4.608-11.328v1.68h4.048l-2.592 3.008v1.44a4.081 4.081 0 011.2-.176c.832 0 1.483.17 1.952.512.47.341.704.8.704 1.376 0 .565-.213 1.002-.64 1.312-.416.298-.95.448-1.6.448-1.003 0-1.963-.32-2.88-.96l-.8 1.52C16.163 19.61 17.352 20 18.568 20c1.216 0 2.208-.326 2.976-.976.779-.651 1.168-1.547 1.168-2.688 0-.854-.288-1.584-.864-2.192-.576-.619-1.376-.944-2.4-.976l2.704-3.024V8.672h-6.544z"
        fill="currentColor"
      />
    </svg>
  );
}

const ForwardRef = React.forwardRef(SvgH3);
export default ForwardRef;
