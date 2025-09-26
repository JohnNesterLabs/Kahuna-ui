import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three-stdlib';
import { OrbitControls } from 'three-stdlib';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';

// Import constants and utilities
import { 
  LENIS_CONFIG, 
  CAMERA_CONFIG, 
  VIDEO_CONFIG,
  COMMON_STYLES,
  TIMELINE_SCALES
} from '../constants';
import {
  getVideoDimensions,
  setModelOpacity,
  debounce,
  updateScrollIndicators
} from '../utils';
import { updateVideoState } from './useVideoState';

gsap.registerPlugin(ScrollTrigger);

export const useAnimationSetup = (mountRef) => {
  const lenisRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;

    // ==================== INITIALIZATION ====================
    // Smooth scrolling with Lenis
    const lenis = new Lenis(LENIS_CONFIG);
    lenisRef.current = lenis;
    lenis.on("scroll", () => {
      ScrollTrigger.update();
    });

    // ==================== THREE.JS SETUP ====================
    // Three.js scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      CAMERA_CONFIG.fov,
      window.innerWidth / window.innerHeight,
      CAMERA_CONFIG.near,
      CAMERA_CONFIG.far
    );
    camera.position.set(CAMERA_CONFIG.position.x, CAMERA_CONFIG.position.y, CAMERA_CONFIG.position.z);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mount?.appendChild(renderer.domElement);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enableZoom = false;

    let gifMesh = null;
    let model2 = null;

    // ==================== VIDEO SETUP ====================
    // Video element with seamless swapping
    const gifElement = document.createElement("div");
    
    // Create video element for hero1 and image sequence container for hero2
    const video1 = document.createElement("video");
    const imageSequenceContainer = document.createElement("div");
    const imageSequenceImg = document.createElement("img");
    
    // Get responsive video dimensions
    const videoDimensions = getVideoDimensions();

    // Video1 styling (responsive small video)
    const video1Style = {
      width: videoDimensions.width,
      height: videoDimensions.height,
      objectFit: "contain",
      position: "absolute",
      top: "0",
      left: "0",
      opacity: "1",
      transition: "opacity 0.3s ease-in-out"
    };
    
    // Image sequence styling (fullscreen - already responsive)
    const imageSequenceStyle = {
      width: "100vw",
      height: "100vh",
      objectFit: "cover",
      position: "fixed",
      top: "0",
      left: "0",
      opacity: "0",
      transition: "opacity 0.3s ease-in-out",
      zIndex: "6", // Higher than video1 container to appear on top
      willChange: "transform", // Optimize for animations
      transform: "translateZ(0)", // Force hardware acceleration
      backfaceVisibility: "hidden", // Optimize rendering
      perspective: "1000px" // Enable 3D acceleration
    };
    
    // Apply styling to video1 and image sequence
    Object.assign(video1.style, video1Style);
    Object.assign(imageSequenceImg.style, imageSequenceStyle);
    
    // Set video sources and properties
    video1.src = "/hero1.mp4";
    Object.assign(video1, VIDEO_CONFIG);
    
    // Image sequence configuration
    const totalFrames = 178; // Updated to match extracted frames from hero2.mp4
    const frameRate = 30; // Frames per second
    const sequenceDuration = totalFrames / frameRate; // Duration in seconds
    let currentFrame = 1; // Start from frame 1 (frame_0001.jpg)
    let isSequenceReady = false;
    let preloadedFrames = new Map(); // Cache for preloaded frames
    
    // Preload first few frames for smooth start
    const preloadFrames = async () => {
      const framesToPreload = Math.min(10, totalFrames);
      for (let i = 1; i <= framesToPreload; i++) { // Start from 1, not 0
        const img = new Image();
        img.src = `/frames/frame_${String(i).padStart(4, '0')}.jpg`;
        preloadedFrames.set(i, img);
      }
      isSequenceReady = true;
      console.log('Image sequence ready for scroll control');
    };
    
    // Load initial frame (frame_0001.jpg)
    imageSequenceImg.src = `/frames/frame_0001.jpg`;
    imageSequenceImg.style.opacity = "0"; // Hidden initially
    
    // Add error handling for image loading
    imageSequenceImg.onerror = () => {
      console.error('Failed to load image sequence frame:', imageSequenceImg.src);
    };
    
    imageSequenceImg.onload = () => {
      console.log('Image sequence frame loaded:', imageSequenceImg.src);
    };
    
    preloadFrames();
    
    // Container styling (responsive for video1)
    gifElement.style.width = videoDimensions.width;
    gifElement.style.height = videoDimensions.height;
    gifElement.style.position = "fixed";
    gifElement.style.top = "50%";
    gifElement.style.right = videoDimensions.right;
    gifElement.style.transform = `translateY(-50%) scale(${videoDimensions.scale})`;
    gifElement.style.zIndex = COMMON_STYLES.Z_INDEX.VIDEO_CONTAINER;
    gifElement.style.pointerEvents = "none";
    gifElement.style.overflow = "hidden";
    
    // Add video1 to container, image sequence directly to body
    gifElement.appendChild(video1);
    document.body.appendChild(gifElement);
    document.body.appendChild(imageSequenceImg);
    gifMesh = gifElement;
    
    // Preload video1 for seamless swapping
    video1.load();

    // ==================== DYNAMIC SCALING SYSTEM ====================
    // Calculate dynamic scale based on screen height
    const getDynamicScale = (baseScale) => {
      const referenceHeight = 730; // Your laptop height as reference
      const currentHeight = window.innerHeight;
      const heightRatio = currentHeight / referenceHeight;
      
      // Apply scaling factor with some limits to prevent extreme scaling
      const scaledValue = baseScale * heightRatio;
      
      // Clamp the scale between reasonable limits
      const finalScale = Math.max(1.5, Math.min(6, scaledValue));
      
      // Debug logging
      console.log(`Screen height: ${currentHeight}px, Base scale: ${baseScale}, Final scale: ${finalScale.toFixed(2)}`);
      
      return finalScale;
    };

    // ==================== ANIMATION TIMELINE ====================
    // GIF Timeline (smooth across sections)
     const gifTimeline = gsap.timeline({
       scrollTrigger: {
         trigger: ".section-1",
         start: "top top",
         endTrigger: ".section-4",
         end: "bottom bottom",
         scrub: true,
       },
     });

     // Section 1: Stay on right side initially
     gifTimeline.set(gifElement, {
       left: "auto",
       right: "10%",
       top: "50%",
       xPercent: 0,
       yPercent: -50,
       scale: getDynamicScale(TIMELINE_SCALES.SECTION_1),
     }); 

     // Section 1 to mid-Section 2: Move to center
     gifTimeline.to(gifElement, {
       duration: 0.3, // Shorter duration to reach center faster
       left: "50%",
       right: "auto",
       top: "60%",
       xPercent: -50,
       yPercent: -50,
       scale: getDynamicScale(2), // Dynamic scale for center
       ease: COMMON_STYLES.EASE_TYPE,
     });

     // Mid-Section 2 to Section 3: Move to left
     gifTimeline.to(gifElement, {
       duration: 0.1,
       left: "10%",
       right: "auto",
       top: "50%", // Match section 2 text alignment
       xPercent: 0,
       yPercent: -50,
       scale: getDynamicScale(TIMELINE_SCALES.SECTION_2),
       ease: COMMON_STYLES.EASE_TYPE,
     });

     // Section 3: Move back to center
     gifTimeline.to(gifElement, {
       duration: 0.5,
       left: "50%",
       right: "auto",
       top: "50%",
       xPercent: -50,
       yPercent: -50,
       scale: getDynamicScale(TIMELINE_SCALES.SECTION_3),
       ease: COMMON_STYLES.EASE_TYPE,
     });

     // Section 4: Stay in center but increase scale dynamically based on screen height
     gifTimeline.to(gifElement, {
       duration: 0.5,
       left: "50%",
       right: "auto",
       top: "50%",
       xPercent: -50,
       yPercent: -50,
       scale: getDynamicScale(TIMELINE_SCALES.SECTION_4),
       ease: COMMON_STYLES.EASE_TYPE,
     });

    // ==================== VIDEO SWAP & SCROLL CONTROL ====================
     
     // Video swap: Cross-fade from hero1 (small) to image sequence (fullscreen) when section 3 bottom meets section 4 top
     gsap.to({}, {
       scrollTrigger: {
         trigger: ".section-3",
         start: "bottom center", // When section 3 bottom reaches center
         end: "bottom+=100px center",
         onEnter: () => {
           // Switch to fullscreen image sequence
           currentFrame = 1; // Start from beginning (frame_0001.jpg)
           updateVideoState('hero2'); // Update video state
           // Hide video1 container first, then show image sequence
           gsap.to(gifElement, { 
             opacity: 0, 
             duration: COMMON_STYLES.TRANSITION_DURATION,
             onComplete: () => {
               gsap.to(imageSequenceImg, { opacity: 1, duration: COMMON_STYLES.TRANSITION_DURATION });
             }
           });
         },
         onLeaveBack: () => {
           // Switch back to small video1
           video1.currentTime = 0; // Reset to beginning
           updateVideoState('hero1'); // Update video state
           // Hide image sequence first, then show video1 container
           gsap.to(imageSequenceImg, { 
             opacity: 0, 
             duration: COMMON_STYLES.TRANSITION_DURATION,
             onComplete: () => {
               gsap.to(gifElement, { opacity: 1, duration: COMMON_STYLES.TRANSITION_DURATION });
             }
           });
         },
       },
     });

     // Scroll-based image sequence control (only for hero2 in section 4)
     gsap.to(imageSequenceImg, {
       scrollTrigger: {
         trigger: ".section-4",
         start: "top center",
         end: "bottom center",
         scrub: true, // Perfect sync with scroll
         onUpdate: (self) => {
           // Control image sequence based on scroll progress
           if (isSequenceReady) {
             const targetFrame = Math.floor(self.progress * (totalFrames - 1)) + 1; // +1 because frames start from 1
             
             // Only update if frame changed to avoid unnecessary DOM updates
             if (targetFrame !== currentFrame) {
               currentFrame = targetFrame;
               console.log('Updating to frame:', currentFrame, 'Progress:', self.progress);
               
               // Check if we've reached the last frame
               if (currentFrame >= totalFrames) {
                 console.log('Last frame reached, switching to ScrollZoomImage');
                 updateVideoState('scrollZoom');
                 // Hide image sequence
                 gsap.to(imageSequenceImg, { 
                   opacity: 0, 
                   duration: COMMON_STYLES.TRANSITION_DURATION 
                 });
                 return;
               }
               
               // Check if frame is preloaded, otherwise load it
               if (preloadedFrames.has(currentFrame)) {
                 imageSequenceImg.src = preloadedFrames.get(currentFrame).src;
               } else {
                 // Load frame on demand
                 const frameNumber = String(currentFrame).padStart(4, '0');
                 imageSequenceImg.src = `/frames/frame_${frameNumber}.jpg`;
                 
                 // Preload next few frames
                 for (let i = 1; i <= 3; i++) {
                   const nextFrame = currentFrame + i;
                   if (nextFrame <= totalFrames && !preloadedFrames.has(nextFrame)) {
                     const img = new Image();
                     img.src = `/frames/frame_${String(nextFrame).padStart(4, '0')}.jpg`;
                     preloadedFrames.set(nextFrame, img);
                   }
                 }
               }
             }
           }
         },
         onLeaveBack: () => {
           // Reset image sequence when leaving section 4
           currentFrame = 1;
           imageSequenceImg.src = `/frames/frame_0001.jpg`;
           // Switch back to image sequence from ScrollZoomImage
           updateVideoState('hero2');
           gsap.to(imageSequenceImg, { 
             opacity: 1, 
             duration: COMMON_STYLES.TRANSITION_DURATION 
           });
         },
       },
     });

     // ScrollZoomImage transition trigger
     gsap.to({}, {
       scrollTrigger: {
         trigger: ".section-4",
         start: "bottom center",
         end: "bottom+=200px center",
         onEnter: () => {
           // Switch to ScrollZoomImage when reaching the end of section 4
           console.log('Transitioning to ScrollZoomImage');
           updateVideoState('scrollZoom');
           gsap.to(imageSequenceImg, { 
             opacity: 0, 
             duration: COMMON_STYLES.TRANSITION_DURATION 
           });
         },
         onLeaveBack: () => {
           // Switch back to image sequence when scrolling back up
           console.log('Switching back to image sequence');
           updateVideoState('hero2');
           gsap.to(imageSequenceImg, { 
             opacity: 1, 
             duration: COMMON_STYLES.TRANSITION_DURATION 
           });
         },
       },
     });

    // ==================== 3D MODEL SETUP ====================
    // Second model
    const loader = new GLTFLoader();
    loader.load("/singularity_001.glb", (gltf) => {
      model2 = gltf.scene;
      model2.scale.set(1, 1, 1);
      model2.position.set(0, -0.5, -2);
      setModelOpacity(model2, 0);
      model2.visible = false;
      scene.add(model2);

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ".section-3",
          start: "bottom center",
          end: "bottom+=400 center",
          scrub: true,
        },
      });

      tl.to(camera.position, { z: 4, ease: "power2.inOut" }, 0);

      tl.to(
        {},
        {
          duration: 1,
          onUpdate: () => {
            const progress = tl.progress();
            if (gifMesh) {
              gifMesh.style.opacity = String(1 - progress);
              gifMesh.style.visibility = progress < 1 ? "visible" : "hidden";
            }
            if (model2) {
              setModelOpacity(model2, progress);
              model2.visible = progress > 0;
            }
          },
        },
        0
      );
    });

    // ==================== SCROLL INDICATORS ====================

     // Update indicators on scroll
     window.addEventListener('scroll', updateScrollIndicators);
     updateScrollIndicators(); // Initial update

    // ==================== RENDER LOOP ====================
    // RAF loop
     let rafId;
     const raf = (time) => {
       lenis.raf(time);
       controls.update();
       renderer.render(scene, camera);
       rafId = requestAnimationFrame(raf);
     };
     rafId = requestAnimationFrame(raf);

    // Optimized resize handler with debouncing
    const handleResize = debounce(() => {
      // Update camera and renderer
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      
      // Update video dimensions on resize
      const newDimensions = getVideoDimensions();
      gifElement.style.width = newDimensions.width;
      gifElement.style.height = newDimensions.height;
      gifElement.style.right = newDimensions.right;
      gifElement.style.transform = `translateY(-50%) scale(${newDimensions.scale})`;
      
      video1.style.width = newDimensions.width;
      video1.style.height = newDimensions.height;
      
      // Refresh ScrollTrigger to recalculate dynamic scales
      ScrollTrigger.refresh();
      
      console.log('Dynamic scale updated for screen height:', window.innerHeight);
    }, 100);
    window.addEventListener("resize", handleResize);

    // ==================== CLEANUP ====================
     return () => {
       window.removeEventListener("resize", handleResize);
       window.removeEventListener("scroll", updateScrollIndicators);
       cancelAnimationFrame(rafId);
       if (lenisRef.current) lenisRef.current.destroy();
       ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
       if (mount && renderer.domElement && mount.contains(renderer.domElement)) {
         mount.removeChild(renderer.domElement);
       }
       if (gifMesh && gifMesh.parentNode) {
         gifMesh.parentNode.removeChild(gifMesh);
       }
       if (imageSequenceImg && imageSequenceImg.parentNode) {
         imageSequenceImg.parentNode.removeChild(imageSequenceImg);
       }
     };
  }, []);

  return lenisRef;
};
