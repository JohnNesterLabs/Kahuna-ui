import React from 'react';
import SectionWrapper from './SectionWrapper';
import { createResponsiveTextStyle } from '../../utils';
import { VideoTextOverlay } from '../ui';
import { useVideoState } from '../../hooks/useVideoState';

const Section4 = () => {
  const { isVideo2Active } = useVideoState();

  return (
    <SectionWrapper sectionNumber={4}>
      <div
        className="text-4"
        style={{ position: "relative", top: "40%", left: "10%", zIndex: 1 }}
      >
        <h1 style={createResponsiveTextStyle('h1')}>Singularity</h1>
        <p style={createResponsiveTextStyle('p')}>The future beyond imagination</p>
      </div>
      
      {/* Video Text Overlay - appears only when hero2 video is fullscreen */}
      <VideoTextOverlay text="EVERYTHING" isVisible={isVideo2Active} />
    </SectionWrapper>
  );
};

export default Section4;
