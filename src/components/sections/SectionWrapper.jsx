import React from 'react';
import { SECTION_COLORS } from '../../constants';
import { createSectionLabelStyle } from '../../utils';

const SectionWrapper = ({ 
  children, 
  sectionNumber, 
  sectionTitle, 
  className = "", 
  style = {},
  showBorders = true
}) => {
  const borderColor = SECTION_COLORS[`SECTION_${sectionNumber}`];
  
  const borderStyles = showBorders ? {
    borderTop: `3px solid ${borderColor}`,
    borderBottom: `3px solid ${borderColor}`,
    borderLeft: `3px solid ${borderColor}`,
    borderRight: `3px solid ${borderColor}`,
  } : {};
  
  return (
    <section 
      className={`section section-${sectionNumber} ${className}`}
      style={{
        height: "100vh",
        position: "relative",
        ...borderStyles,
        ...style
      }}
    >
      {/* {sectionTitle && (
        <div style={createSectionLabelStyle()}>
          SECTION {sectionNumber} - {sectionTitle}
        </div>
      )} */}
      {children}
    </section>
  );
};

export default SectionWrapper;
