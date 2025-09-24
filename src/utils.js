// Utility functions for the Animation component

import { BREAKPOINTS, TEXT_SIZES, VIDEO_DIMENSIONS, COMMON_STYLES } from './constants';

// Device type detection
export const getDeviceType = () => {
  const width = window.innerWidth;
  if (width <= BREAKPOINTS.MOBILE) return 'MOBILE';
  if (width <= BREAKPOINTS.TABLET) return 'TABLET';
  return 'DESKTOP';
};

// Generic responsive value getter
export const getResponsiveValue = (values) => {
  const deviceType = getDeviceType();
  return values[deviceType];
};

// Video dimensions getter
export const getVideoDimensions = () => getResponsiveValue(VIDEO_DIMENSIONS);

// Text sizes getter
export const getTextSizes = () => getResponsiveValue(TEXT_SIZES);

// Three.js model opacity setter
export const setModelOpacity = (model, opacity) => {
  if (!model) return;
  model.traverse((child) => {
    if (child.isMesh && child.material) {
      child.material.transparent = true;
      child.material.opacity = opacity;
    }
  });
};

// Create responsive text styling
export const createResponsiveTextStyle = (elementType = 'h1') => {
  const textSizes = getTextSizes();
  const fontSize = elementType === 'h1' ? textSizes.h1 : textSizes.p;
  
  return {
    fontSize,
    fontWeight: "300",
    margin: "0 0 20px 0",
    lineHeight: elementType === 'h1' ? "1.2" : "1.4",
    ...(elementType === 'p' && { opacity: 0.9 })
  };
};

// Create section label styling
export const createSectionLabelStyle = () => {
  const isMobile = getDeviceType() === 'MOBILE';
  
  return {
    position: "absolute",
    top: isMobile ? "15px" : "20px",
    left: "50%",
    transform: "translateX(-50%)",
    background: COMMON_STYLES.COLORS.TRANSPARENT_WHITE,
    padding: isMobile ? "6px 15px" : "8px 20px",
    borderRadius: "20px",
    fontSize: isMobile ? "10px" : "12px",
    fontWeight: "600",
    letterSpacing: "1px",
    zIndex: COMMON_STYLES.Z_INDEX.VIDEO_CONTAINER,
  };
};

// Create header styling
export const createHeaderStyle = () => {
  const isMobile = getDeviceType() === 'MOBILE';
  
  return {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    padding: isMobile ? "15px 20px" : "20px 30px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: COMMON_STYLES.Z_INDEX.HEADER,
    background: "transparent",
    boxSizing: "border-box",
  };
};

// Create scroll indicator styling
export const createScrollIndicatorStyle = () => {
  const isMobile = getDeviceType() === 'MOBILE';
  
  return {
    position: "fixed",
    top: isMobile ? "15px" : "20px",
    right: isMobile ? "15px" : "20px",
    background: COMMON_STYLES.COLORS.TRANSPARENT_WHITE,
    padding: isMobile ? "8px" : "10px",
    borderRadius: "5px",
    fontSize: isMobile ? "10px" : "12px",
    zIndex: COMMON_STYLES.Z_INDEX.SCROLL_INDICATOR,
    color: COMMON_STYLES.COLORS.WHITE,
  };
};

// Create center lines styling
export const createCenterLinesStyle = () => ({
  position: "fixed",
  background: "rgba(255, 255, 255, 0.5)",
  zIndex: COMMON_STYLES.Z_INDEX.CENTER_LINES,
  pointerEvents: "none"
});

// Debounce function for performance optimization
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Update scroll indicators
export const updateScrollIndicators = () => {
  const scrollPercentage = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
  const scrollElement = document.getElementById('scroll-percentage');
  if (scrollElement) scrollElement.textContent = scrollPercentage + '%';
  
  // Determine current section
  const sections = document.querySelectorAll('.section');
  let currentSection = 1;
  sections.forEach((section, index) => {
    const rect = section.getBoundingClientRect();
    if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
      currentSection = index + 1;
    }
  });
  const sectionElement = document.getElementById('current-section');
  if (sectionElement) sectionElement.textContent = currentSection;
};
