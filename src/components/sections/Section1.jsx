import React from 'react';
import SectionWrapper from './SectionWrapper';
import { createResponsiveTextStyle } from '../../utils';

const Section1 = () => {
  return (
    <SectionWrapper sectionNumber={1} sectionTitle="Kahuna AI">
      <div
        className="text-1"
        style={{
          position: "absolute",
          top: "50%",
          left: "10%",
          transform: "translateY(-50%)",
          textAlign: "left",
          zIndex: 1,
        }}
      >
        <h1 style={createResponsiveTextStyle('h1')}>
          Support is broken
        </h1>
        <p style={createResponsiveTextStyle('p')}>
          Fragmented solutions are not cutting it for 2025
        </p>
      </div>
    </SectionWrapper>
  );
};

export default Section1;
