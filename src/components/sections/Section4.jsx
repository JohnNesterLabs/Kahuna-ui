import React from 'react';
import SectionWrapper from './SectionWrapper';
import { createResponsiveTextStyle } from '../../utils';

const Section4 = () => {
  return (
    <SectionWrapper sectionNumber={4}>
      <div
        className="text-4"
        style={{ position: "relative", top: "40%", left: "10%", zIndex: 1 }}
      >
        <h1 style={createResponsiveTextStyle('h1')}>Singularity</h1>
        <p style={createResponsiveTextStyle('p')}>The future beyond imagination</p>
      </div>
    </SectionWrapper>
  );
};

export default Section4;
