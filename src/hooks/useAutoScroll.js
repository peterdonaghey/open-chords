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
        rafRef.current = requestAnimationFrame(scroll);
        return; // Skip first frame to establish timing
      }

      const elapsed = timestamp - lastTimeRef.current;
      
      // Calculate pixels per SECOND, then scale by elapsed time
      // Speed 1: 10px/sec (very slow but clearly visible)
      // Speed 5: 50px/sec (comfortable reading pace)
      // Speed 10: 100px/sec (fast but usable)
      const pixelsPerSecond = 10 + (speed - 1) * 10;
      
      // Convert to pixels for this frame based on actual elapsed time
      const scrollAmount = pixelsPerSecond * (elapsed / 1000);
      
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

