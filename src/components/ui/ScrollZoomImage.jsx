import React, { useEffect, useRef } from "react";
import { updateVideoState } from "../../hooks/useVideoState";

const points = [
  { x: 35, y: 26, card: "c1", text: "This is card 1 text describing point 1." },
  { x: 80, y: 63, card: "c2", text: "This is card 2 text describing point 2." },
  { x: 80, y: 29, card: "c3", text: "This is card 3 text describing point 3." },
  { x: 40, y: 72, card: "c4", text: "This is card 4 text describing point 4." },
];

export default function ScrollZoomImage() {
  const sceneRef = useRef(null);
  const cardRefs = useRef({});
  const containerRef = useRef(null);

  // Add CSS animations
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes cardPulse {
        0%, 100% {
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
          border-color: grey;
        }
        50% {
          box-shadow: 0 6px 20px rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.4);
        }
      }
      
      @keyframes textGlow {
        0% {
          text-shadow: 0 0 10px rgba(255,255,255,0.3);
        }
        100% {
          text-shadow: 0 0 15px rgba(255,255,255,0.6);
        }
      }
      
      @keyframes cardFloat {
        0%, 100% {
          transform: translate(-50%, -50%) translateY(0px);
        }
        50% {
          transform: translate(-50%, -50%) translateY(-5px);
        }
      }
      
      @keyframes particleMove {
        0% {
          transform: translateX(0px) translateY(0px);
        }
        25% {
          transform: translateX(200px) translateY(0px);
        }
        50% {
          transform: translateX(200px) translateY(50px);
        }
        75% {
          transform: translateX(0px) translateY(50px);
        }
        100% {
          transform: translateX(0px) translateY(0px);
        }
      }
      
      @keyframes particleGlow {
        0%, 100% {
          opacity: 0.6;
          box-shadow: 0 0 5px rgba(255, 255, 255, 0.8);
        }
        50% {
          opacity: 1;
          box-shadow: 0 0 15px rgba(255, 255, 255, 1);
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

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
          background: "url('/frames/frame_0177.jpg') no-repeat center center, linear-gradient(45deg, #333, #666)",
          backgroundSize: 'cover',
          transformOrigin: 'center',
          transition: 'transform 1s ease',
          zIndex: 1, // Ensure it's above other content
        }}
      >
        {points.map((p, idx) => (
          <React.Fragment key={`point-${idx}`}>
            {/* Point */}
            {/* <div
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
            /> */}
            
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
                animation: 'cardPulse 3s ease-in-out infinite, cardFloat 4s ease-in-out infinite',
                cursor: 'pointer',
              }}
              >
                {/* Animated particles moving around the border */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  overflow: 'hidden',
                  borderRadius: '8px',
                  pointerEvents: 'none',
                }}>
                  {/* Particle 1 - Top to Right */}
                  <div style={{
                    position: 'absolute',
                    top: '2px',
                    left: '2px',
                    width: '4px',
                    height: '4px',
                    background: 'rgba(255, 255, 255, 0.8)',
                    borderRadius: '50%',
                    animation: 'particleMove 8s linear infinite, particleGlow 2s ease-in-out infinite',
                  }} />
                  
                  {/* Particle 2 - Right to Bottom */}
                  <div style={{
                    position: 'absolute',
                    top: '2px',
                    left: '2px',
                    width: '3px',
                    height: '3px',
                    background: 'rgba(255, 255, 255, 0.6)',
                    borderRadius: '50%',
                    animation: 'particleMove 8s linear infinite 2s, particleGlow 2.5s ease-in-out infinite',
                  }} />
                  
                  {/* Particle 3 - Bottom to Left */}
                  <div style={{
                    position: 'absolute',
                    top: '2px',
                    left: '2px',
                    width: '5px',
                    height: '5px',
                    background: 'rgba(255, 255, 255, 0.7)',
                    borderRadius: '50%',
                    animation: 'particleMove 8s linear infinite 4s, particleGlow 1.8s ease-in-out infinite',
                  }} />
                  
                  {/* Particle 4 - Left to Top */}
                  <div style={{
                    position: 'absolute',
                    top: '2px',
                    left: '2px',
                    width: '3px',
                    height: '3px',
                    background: 'rgba(255, 255, 255, 0.5)',
                    borderRadius: '50%',
                    animation: 'particleMove 8s linear infinite 6s, particleGlow 3s ease-in-out infinite',
                  }} />
                </div>
                
                <div style={{
                  animation: 'textGlow 2s ease-in-out infinite alternate',
                  textShadow: '0 0 10px rgba(255,255,255,0.3)',
                  position: 'relative',
                  zIndex: 2,
                }}>
                  {p.text}
                </div>
              </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
