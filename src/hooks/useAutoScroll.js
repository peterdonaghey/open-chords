import { useState, useEffect, useRef } from 'react';

/**
 * Auto-scroll hook for smooth scrolling through song content
 * @param {boolean} enabled - Whether auto-scroll is enabled
 * @param {number} speed - Scroll speed multiplier (1-10)
 */
export function useAutoScroll(enabled = false, speed = 3) {
  const [isScrolling, setIsScrolling] = useState(false);
  const rafRef = useRef(null);
  const lastTimeRef = useRef(null);

  useEffect(() => {
    if (!enabled || !isScrolling) {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      lastTimeRef.current = null;
      return;
    }

    const scroll = (timestamp) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = timestamp;
      }

      const elapsed = timestamp - lastTimeRef.current;
      
      // Simple linear progression - very slow to moderate
      // Speed 1: 0.15 pixels/frame = ~9px/sec (very slow but visible)
      // Speed 10: 1.5 pixels/frame = ~90px/sec (comfortable reading)
      const baseSpeed = 0.15;
      const increment = 0.15;
      const speedMultiplier = baseSpeed + (speed - 1) * increment;
      const scrollAmount = speedMultiplier * (elapsed / 16.67); // Normalized to 60fps
      
      window.scrollBy(0, scrollAmount);
      lastTimeRef.current = timestamp;

      // Check if reached bottom
      const scrolledToBottom = 
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 10;

      if (scrolledToBottom) {
        setIsScrolling(false);
        return;
      }

      rafRef.current = requestAnimationFrame(scroll);
    };

    rafRef.current = requestAnimationFrame(scroll);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [enabled, isScrolling, speed]);

  // Keyboard shortcut for spacebar
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setIsScrolling(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return {
    isScrolling,
    toggle: () => setIsScrolling(prev => !prev),
    start: () => setIsScrolling(true),
    stop: () => setIsScrolling(false),
  };
}

