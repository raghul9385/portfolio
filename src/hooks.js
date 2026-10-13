import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { openResume } from './resume.js';

export const EASE = [0.2, 0.8, 0.2, 1];

const matches = (query) => typeof window !== 'undefined' && window.matchMedia(query).matches;
export const prefersReducedMotion = () => matches('(prefers-reduced-motion: reduce)');
export const hasFinePointer = () => matches('(pointer: fine)');

export const ToastContext = createContext(() => {});
export const useToast = () => useContext(ToastContext);

/** Click handler that opens the printable résumé and tells the visitor what happened. */
export function useOpenResume() {
  const toast = useToast();
  return useCallback(() => {
    if (openResume()) toast('Résumé ready — save it as PDF from the print dialog');
    else toast('Allow pop-ups to open your résumé');
  }, [toast]);
}

/**
 * Leans an element toward the mouse in 3D. Writes `--rx`/`--ry` (rotation)
 * and `--mx`/`--my` (pointer position, for the glare) as CSS variables, at
 * most once a frame, so the browser only recomposites a transform.
 * `scope` is a selector for a larger ancestor that should catch the pointer.
 * Does nothing on touch screens or for visitors who ask for reduced motion.
 */
export function useTilt({ max = 8, scope } = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || !hasFinePointer() || prefersReducedMotion()) return undefined;

    const area = (scope && element.closest(scope)) || element;
    const clamp = (n) => Math.max(-1, Math.min(1, n));
    let frame = 0;

    const set = (x, y) => {
      element.style.setProperty('--ry', `${(x * max).toFixed(2)}deg`);
      element.style.setProperty('--rx', `${(-y * max * 0.75).toFixed(2)}deg`);
      element.style.setProperty('--mx', `${((x + 1) * 50).toFixed(1)}%`);
      element.style.setProperty('--my', `${((y + 1) * 50).toFixed(1)}%`);
    };
    const follow = (event) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const box = element.getBoundingClientRect();
        set(
          clamp(((event.clientX - box.left) / box.width) * 2 - 1),
          clamp(((event.clientY - box.top) / box.height) * 2 - 1),
        );
      });
    };
    const reset = () => {
      cancelAnimationFrame(frame);
      set(0, 0);
    };

    area.addEventListener('pointermove', follow);
    area.addEventListener('pointerleave', reset);
    return () => {
      cancelAnimationFrame(frame);
      area.removeEventListener('pointermove', follow);
      area.removeEventListener('pointerleave', reset);
    };
  }, [max, scope]);

  return ref;
}

/** Live clock string for a time zone, ticking every second. */
export function useClock(timeZone) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(now);
}
