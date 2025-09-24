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
    
    // Create both video elements with identical styling
    const video1 = document.createElement("video");
    const video2 = document.createElement("video");
    
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
    
    // Video2 styling (fullscreen video - already responsive)
    const video2Style = {
      width: "100vw",
      height: "100vh",
      objectFit: "cover",
      position: "fixed",
      top: "0",
      left: "0",
      opacity: "0",
      transition: "opacity 0.3s ease-in-out",
      zIndex: "1"
    };
    
    // Apply styling to both videos
    Object.assign(video1.style, video1Style);
    Object.assign(video2.style, video2Style);
    
    // Set video sources and properties
    video1.src = "/sample1.mp4";
    Object.assign(video1, VIDEO_CONFIG);
    
    video2.src = "/sample2.mp4";
    Object.assign(video2, { ...VIDEO_CONFIG, autoplay: false, loop: false });
    video2.style.opacity = "0"; // Hidden initially
    
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
    
    // Add video1 to container, video2 directly to body
    gifElement.appendChild(video1);
    document.body.appendChild(gifElement);
    document.body.appendChild(video2);
    gifMesh = gifElement;
    
    // Preload both videos for seamless swapping
    video1.load();
    video2.load();

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
       scale: TIMELINE_SCALES.SECTION_1,
     }); 

     // Section 1 to mid-Section 2: Move to center
     gifTimeline.to(gifElement, {
       duration: 0.3, // Shorter duration to reach center faster
       left: "50%",
       right: "auto",
       top: "60%",
       xPercent: -50,
       yPercent: -50,
       scale: 2, // Decrease to 50% zoom in center
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
       scale: TIMELINE_SCALES.SECTION_2,
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
       scale: TIMELINE_SCALES.SECTION_3,
       ease: COMMON_STYLES.EASE_TYPE,
     });

     // Section 4: Stay in center but increase scale to 3
     gifTimeline.to(gifElement, {
       duration: 0.5,
       left: "50%",
       right: "auto",
       top: "50%",
       xPercent: -50,
       yPercent: -50,
       scale: TIMELINE_SCALES.SECTION_4,
       ease: COMMON_STYLES.EASE_TYPE,
     });

    // ==================== VIDEO SWAP & SCROLL CONTROL ====================
     
     // Video swap: Cross-fade from sample1 (small) to sample2 (fullscreen) when section 3 bottom meets section 4 top
     gsap.to({}, {
       scrollTrigger: {
         trigger: ".section-3",
         start: "bottom center", // When section 3 bottom reaches center
         end: "bottom+=100px center",
         onEnter: () => {
           // Switch to fullscreen video2
           video2.currentTime = 0; // Start from beginning
           gsap.to(gifElement, { opacity: 0, duration: COMMON_STYLES.TRANSITION_DURATION }); // Hide video1 container
           gsap.to(video2, { opacity: 1, duration: COMMON_STYLES.TRANSITION_DURATION }); // Show fullscreen video2
         },
         onLeaveBack: () => {
           // Switch back to small video1
           video1.currentTime = 0; // Reset to beginning
           gsap.to(video2, { opacity: 0, duration: COMMON_STYLES.TRANSITION_DURATION }); // Hide fullscreen video2
           gsap.to(gifElement, { opacity: 1, duration: COMMON_STYLES.TRANSITION_DURATION }); // Show video1 container
         },
       },
     });

     // Scroll-based video playback control (only for sample2 in section 4)
     gsap.to(video2, {
       scrollTrigger: {
         trigger: ".section-4",
         start: "top center",
         end: "bottom center",
         scrub: 1,
         onUpdate: (self) => {
           // Control video2 playback based on scroll progress
           if (video2 && video2.duration) {
             video2.currentTime = self.progress * video2.duration;
           }
         },
         onLeaveBack: () => {
           // Reset video2 when leaving section 4
           if (video2) {
             video2.currentTime = 0;
           }
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
      
      ScrollTrigger.refresh();
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
     };
  }, []);

  return lenisRef;
};
