import React from 'react';
import SectionWrapper from './SectionWrapper';
import { createResponsiveTextStyle } from '../../utils';

const Section2 = () => {
  return (
    <SectionWrapper sectionNumber={2} sectionTitle="Support is broken">
      <div
        className="text-2"
        style={{
          position: "relative",
          top: "40%",
          right: "10%",
          textAlign: "right",
          zIndex: 1,
        }}
      >
        <h1 style={createResponsiveTextStyle('h1')}>Kahuna AI</h1>
        <p style={createResponsiveTextStyle('p')}>The future of support. Enterprise grade & secure</p>
      </div>
    </SectionWrapper>
  );
};

export default Section2;
