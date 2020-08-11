import React from "react";

function LoadingSpinner(props) {
  let { className } = props;

  return (
    <div className={className || "col-12" + " spinner-border text-info"}>
      <span className="sr-only">{props.text}</span>
    </div>
  );
}

export default LoadingSpinner;
