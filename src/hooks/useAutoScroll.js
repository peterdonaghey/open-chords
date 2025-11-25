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
      
      // Much slower scroll speeds with better tapering
      // Speed 1 = 0.1x, Speed 10 = 3x (logarithmic scale)
      const speedMultiplier = speed === 1 ? 0.1 : Math.pow(speed / 3, 1.5);
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

