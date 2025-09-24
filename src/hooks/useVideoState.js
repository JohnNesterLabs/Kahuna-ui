import { useState, useEffect } from 'react';

// Global state for video tracking
let currentVideoState = 'sample1';
let listeners = new Set();

const setVideoState = (newState) => {
  currentVideoState = newState;
  listeners.forEach(listener => listener(newState));
};

export const useVideoState = () => {
  const [videoState, setVideoStateLocal] = useState(currentVideoState);

  useEffect(() => {
    const listener = (newState) => {
      setVideoStateLocal(newState);
    };
    
    listeners.add(listener);
    
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return {
    activeVideo: videoState,
    isVideo2Active: videoState === 'sample2',
    isVideo1Active: videoState === 'sample1',
  };
};

// Function to update video state from useAnimationSetup
export const updateVideoState = (videoType) => {
  setVideoState(videoType);
};
