import React from "react";
import { FluidCursor } from '../ui';

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
        // position: "relative",
      }}
    >
      {children}
      
      {/* Fluid Cursor Effect */}
      <FluidCursor />
    </div>
  );
};

export default MainLayout;
