import { useState, useEffect, useRef } from 'react';

export interface UseAutoScrollReturn {
  isScrolling: boolean;
  toggle: () => void;
  start: () => void;
  stop: () => void;
}

/**
 * Auto-scroll hook for smooth scrolling through song content
 */
export function useAutoScroll(enabled = false, speed = 3): UseAutoScrollReturn {
  const [isScrolling, setIsScrolling] = useState(false);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled || !isScrolling) {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      lastTimeRef.current = null;
      return;
    }

    const scroll = (timestamp: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = timestamp;
        rafRef.current = requestAnimationFrame(scroll);
        return;
      }

      const elapsed = timestamp - lastTimeRef.current;
      const pixelsPerSecond = 10 + (speed - 1) * 10;
      const scrollAmount = pixelsPerSecond * (elapsed / 1000);

      window.scrollBy(0, scrollAmount);
      lastTimeRef.current = timestamp;

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
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [enabled, isScrolling, speed]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (
        e.code === 'Space' &&
        (e.target as HTMLElement).tagName !== 'INPUT' &&
        (e.target as HTMLElement).tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        setIsScrolling((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return {
    isScrolling,
    toggle: () => setIsScrolling((prev) => !prev),
    start: () => setIsScrolling(true),
    stop: () => setIsScrolling(false),
  };
}
