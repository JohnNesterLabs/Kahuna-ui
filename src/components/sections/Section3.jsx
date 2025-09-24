import React from 'react';
import SectionWrapper from './SectionWrapper';
import { createResponsiveTextStyle } from '../../utils';

const Section3 = () => {
  return (
    <SectionWrapper sectionNumber={3}>
      <div
        className="text-3"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "100%",
          padding: "0 14%",
          position: "relative",
          zIndex: 1,
        }}
      >
        <h1 style={createResponsiveTextStyle('h1')}>A map</h1>
        <h1 style={createResponsiveTextStyle('h1')}>that knows</h1>
      </div>
    </SectionWrapper>
  );
};

export default Section3;
