// Constants and configuration for the Animation component

// Responsive breakpoints
export const BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1024,
};

// Video dimensions for different screen sizes
export const VIDEO_DIMENSIONS = {
  MOBILE: { width: "150px", height: "150px", right: "2%", scale: "2.5" },
  TABLET: { width: "250px", height: "250px", right: "8%", scale: "4.0" },
  DESKTOP: { width: "300px", height: "300px", right: "10%", scale: "4.8" },
};

// Text sizes for different screen sizes
export const TEXT_SIZES = {
  MOBILE: { h1: "2rem", p: "1rem", h1Small: "1.5rem" },
  TABLET: { h1: "2.5rem", p: "1.1rem", h1Small: "2rem" },
  DESKTOP: { h1: "3.5rem", p: "1.2rem", h1Small: "3.5rem" },
};

// Section border colors
export const SECTION_COLORS = {
  SECTION_1: "#00ff00",
  SECTION_2: "#ff0000", 
  SECTION_3: "#0000ff",
  SECTION_4: "#ffff00",
  SECTION_5: "#ffff00",
};

// Animation timeline scales
export const TIMELINE_SCALES = {
  SECTION_1: 4.8, // 80% zoom
  SECTION_2: 4.8, // 80% zoom
  SECTION_3: 2,   // 50% zoom
  SECTION_4: 2.85, // 75% zoom
};

// Common styling values
export const COMMON_STYLES = {
  TRANSITION_DURATION: "0.3s",
  EASE_TYPE: "power2.inOut",
  Z_INDEX: {
    HEADER: 10,
    VIDEO_CONTAINER: 5,
    SCROLL_INDICATOR: 20,
    CENTER_LINES: 15,
  },
  COLORS: {
    TRANSPARENT_WHITE: "rgba(255, 255, 255, 0.2)",
    TRANSPARENT_WHITE_LIGHT: "rgba(255, 255, 255, 0.1)",
    WHITE: "#ffffff",
    BLACK: "#000000",
  },
};

// Lenis smooth scrolling configuration
export const LENIS_CONFIG = {
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  lerp: 0.08,
  smoothWheel: true,
  wheelMultiplier: 1,
  touchMultiplier: 2,
};

// Three.js camera configuration
export const CAMERA_CONFIG = {
  fov: 45,
  near: 0.1,
  far: 1000,
  position: { x: 0, y: 1, z: 5 },
};

// Video element configuration
export const VIDEO_CONFIG = {
  autoplay: true,
  muted: true,
  loop: true,
  playsInline: true,
  controls: false,
  disablePictureInPicture: true,
};
