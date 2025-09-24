import React from 'react';
import { createScrollIndicatorStyle, createCenterLinesStyle } from '../../utils';

const LayoutIndicators = () => {
  return (
    <>
      {/* Visual Layout Indicators */}
      {/* Center Lines */}
      <div style={{
        ...createCenterLinesStyle(),
        top: 0,
        left: "50%",
        width: "2px",
        height: "100vh",
      }}></div>
      
      <div style={{
        ...createCenterLinesStyle(),
        top: "50%",
        left: 0,
        width: "100vw",
        height: "2px",
      }}></div>

      {/* Scroll Position Indicator */}
      <div style={createScrollIndicatorStyle()}>
        <div>Scroll: <span id="scroll-percentage">0%</span></div>
        <div>Section: <span id="current-section">1</span></div>
      </div>
    </>
  );
};

export default LayoutIndicators;
