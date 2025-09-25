import React, { useEffect, useRef } from "react";
import { updateVideoState } from "../../hooks/useVideoState";

const points = [
  { x: 30, y: 40, card: "c1", text: "This is card 1 text describing point 1." },
  { x: 70, y: 60, card: "c2", text: "This is card 2 text describing point 2." },
  { x: 75, y: 30, card: "c3", text: "This is card 3 text describing point 3." },
  { x: 40, y: 70, card: "c4", text: "This is card 4 text describing point 4." },
];

export default function ScrollZoomImage() {
  const sceneRef = useRef(null);
  const cardRefs = useRef({});
  const containerRef = useRef(null);

  useEffect(() => {
    let ticking = false;
    let scrollZoomStartPosition = window.scrollY; // Store the scroll position when component mounts

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollTop = window.scrollY;
          const relativeScrollTop = scrollTop - scrollZoomStartPosition; // Calculate relative scroll
          
          // Calculate which point should be active based on relative scroll position
          const step = window.innerHeight;
          const current = Math.min(Math.floor(relativeScrollTop / step), points.length - 1);

          const scene = sceneRef.current;
          if (!scene) return;

          // Default state: Show all points in full screen (no zoom)
          // Always start with full view, only zoom when user actively scrolls within this component
          if (relativeScrollTop < window.innerHeight * 0.5) {
            // Show full view with all points visible
            scene.style.transform = 'scale(1) translate(0%, 0%)';
            scene.style.transition = 'transform 1s ease';
            
            // Reset all cards to normal state
            points.forEach((pt, index) => {
              const cardEl = cardRefs.current[pt.card];
              if (cardEl) {
                cardEl.style.transform = "translate(-50%, -50%) scale(1)";
                cardEl.style.zIndex = "1";
                cardEl.style.background = "rgba(0,0,0,0.85)";
                cardEl.style.border = "2px solid grey";
                cardEl.style.color = "grey";
              }
            });
          } else {
            // Zoom to specific point
            const p = points[current];
            const scale = 2;
            const panX = 50 - p.x; // Center the point horizontally
            const panY = 50 - p.y; // Center the point vertically
            
            scene.style.transform = `scale(${scale}) translate(${panX}%, ${panY}%)`;
            scene.style.transition = 'transform 1s ease';

            // Highlight the active card
            points.forEach((pt, index) => {
              const cardEl = cardRefs.current[pt.card];
              if (cardEl) {
                if (index === current) {
                  cardEl.style.transform = "translate(-50%, -50%) scale(1.2)";
                  cardEl.style.zIndex = "3";
                  cardEl.style.background = "rgba(0,0,0,0.95)";
                  cardEl.style.border = "2px solid #fff";
                  cardEl.style.color = "#fff";
                } else {
                  cardEl.style.transform = "translate(-50%, -50%) scale(1)";
                  cardEl.style.zIndex = "1";
                  cardEl.style.background = "rgba(0,0,0,0.85)";
                  cardEl.style.border = "2px solid grey";
                  cardEl.style.color = "grey";
                }
              }
            });
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    // Initial call to set proper state - always start with full view
    setTimeout(() => {
      const scene = sceneRef.current;
      if (scene) {
        // Force initial state to full view
        scene.style.transform = 'scale(1) translate(0%, 0%)';
        scene.style.transition = 'transform 1s ease';
        
        // Reset all cards to normal state
        points.forEach((pt, index) => {
          const cardEl = cardRefs.current[pt.card];
          if (cardEl) {
            cardEl.style.transform = "translate(-50%, -50%) scale(1)";
            cardEl.style.zIndex = "1";
            cardEl.style.background = "rgba(0,0,0,0.85)";
            cardEl.style.border = "2px solid grey";
            cardEl.style.color = "grey";
          }
        });
      }
      handleScroll();
    }, 100);

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div 
      ref={containerRef}
      style={{
        height: `${points.length * 100}vh`,
        width: '100%',
        background: '#111',
        fontFamily: 'sans-serif',
        margin: 0,
        padding: 0,
        boxSizing: 'border-box',
        position: 'relative',
        zIndex: 10, // Ensure it appears above other content
        display: 'block', // Ensure it's visible
        visibility: 'visible', // Force visibility
      }}
    >
      <div 
        ref={sceneRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          background: "url('/frames/frame_0178.jpg') no-repeat center center, linear-gradient(45deg, #333, #666)",
          backgroundSize: 'cover',
          transformOrigin: 'center',
          transition: 'transform 1s ease',
          zIndex: 1, // Ensure it's above other content
        }}
      >
        {points.map((p, idx) => (
          <React.Fragment key={`point-${idx}`}>
            {/* Point */}
            <div
              style={{
                position: 'absolute',
                top: `${p.y}%`,
                left: `${p.x}%`,
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: 'red',
                border: '2px solid white',
                transform: 'translate(-50%, -50%)',
                zIndex: 2,
                boxShadow: '0 0 10px rgba(255, 0, 0, 0.5)',
                cursor: 'pointer',
              }}
            />
            
            {/* Card */}
            <div
              ref={(el) => (cardRefs.current[p.card] = el)}
              style={{
                position: 'absolute',
                top: `${p.y + 5}%`, // offset so card is below point
                left: `${p.x}%`,
                width: '200px',
                padding: '15px',
                background: 'rgba(0,0,0,0.85)',
                border: '2px solid grey',
                borderRadius: '8px',
                color: 'grey',
                fontSize: '14px',
                transform: 'translate(-50%, -50%)',
                zIndex: 1,
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(5px)',
              }}
            >
              {p.text}
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
