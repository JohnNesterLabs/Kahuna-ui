import React, { useMemo } from "react";

// Extracted styles for better performance and maintainability
const containerStyles = {
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  zIndex: 10,
  pointerEvents: "none",
  textAlign: "center",
};

const textStyles = {
  fontSize: "clamp(2rem, 4vw, 6rem)",
  fontWeight: "300",
  letterSpacing: "0.1em",
  color: "white",
  textTransform: "uppercase",
  fontFamily: "sans-serif",
  margin: 0,
  padding: "15px 30px",
  textShadow: "0 0 20px rgba(255, 255, 255, 0)",
  opacity: 0.9,
  filter: "drop-shadow(0 0 8px rgba(0, 0, 0, 0.8)) drop-shadow(0 4px 12px rgba(0, 0, 0, 0.6)) drop-shadow(0 8px 20px rgba(0, 0, 0, 0.4))",
};

const VideoTextOverlay = ({ text = "EVERYTHING", isVisible = false }) => {
  // Memoize the text to prevent unnecessary re-renders
  const displayText = useMemo(() => text, [text]);

  // Don't render if not visible
  if (!isVisible) {
    return null;
  }

  return (
    <div style={containerStyles}>
      <h1 style={textStyles}>
        {displayText}
      </h1>
    </div>
  );
};

export default VideoTextOverlay;
