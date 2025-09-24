import React, { useRef } from "react";

// Import components
import { Header, LayoutIndicators } from '../ui';
import { Section1, Section2, Section3, Section4, Section5 } from '../sections';

// Import hooks
import { useAnimationSetup } from '../../hooks';


const HomePage = () => {
  const mountRef = useRef(null);
  
  // Use the custom animation setup hook
  useAnimationSetup(mountRef);

  return (
    <>
      {/* Header */}
      <Header />

       {/* Sticky 3D */}
       <div
         ref={mountRef}
         style={{
           width: "100%",
           height: "100vh",
           position: "fixed",
           top: 0,
           left: 0,
           zIndex: 0,
         }}
       />

       {/* Visual Layout Indicators */}
       {/* <LayoutIndicators /> */}

       {/* Sections */}
       <Section1 />
       <Section2 />
       <Section3 />
       <Section4 />
       <Section5 />
    </>
  );
};

export default HomePage;
