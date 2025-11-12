import React from "react";

const layout = ({ children }) => {
  return (
    <div className="px-5">
      <h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
        Dashboard
      </h1>
      {children}
    </div>
  );
};

export default layout;
