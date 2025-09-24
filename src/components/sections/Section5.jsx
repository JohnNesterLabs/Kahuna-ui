import React from 'react';
import SectionWrapper from './SectionWrapper';
import { createResponsiveTextStyle } from '../../utils';

const Section5 = () => {
  return (
    <SectionWrapper sectionNumber={5}>
      <div
        className="text-5"
        style={{ position: "relative", top: "40%", left: "10%", zIndex: 1 }}
      >
        <h1 style={createResponsiveTextStyle('h1')}>Coming soon.</h1>
        <p style={createResponsiveTextStyle('p')}>We're working on it.</p>
      </div>
    </SectionWrapper>
  );
};

export default Section5;
