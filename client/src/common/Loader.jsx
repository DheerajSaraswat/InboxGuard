import React from "react";

const Loader = ({ size = 48, color = "#E50914", text = "Loading..." }) => (
  <div className="flex flex-col items-center justify-center py-8">
    <div
      className="animate-spin rounded-full border-4 border-t-4"
      style={{
        width: size,
        height: size,
        borderColor: "#e5e7eb",
        borderTopColor: color,
      }}
    />
    {text && <span className="mt-4 text-gray-500 text-lg font-medium">{text}</span>}
  </div>
);

export default Loader;
