import React from "react";

const MainLayout = ({ children }) => {
  return (
    <div
      style={{
        background: "black",
        color: "white",
        overflowX: "hidden",
        width: "100%",
        maxWidth: "100vw",
        boxSizing: "border-box",
        margin: 0,
        padding: 0,
      }}
    >
      {children}
    </div>
  );
};

export default MainLayout;
