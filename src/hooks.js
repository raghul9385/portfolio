import { createContext, useContext, useEffect, useState } from 'react';

export const EASE = [0.2, 0.8, 0.2, 1];

const query = (q) => typeof window !== 'undefined' && window.matchMedia(q).matches;
export const prefersReducedMotion = () => query('(prefers-reduced-motion: reduce)');
export const hasFinePointer = () => query('(pointer: fine)');

export const ToastContext = createContext(() => {});
export const PaletteContext = createContext('ocean');
export const usePalette = () => useContext(PaletteContext);
export const useToast = () => useContext(ToastContext);

/** Live clock string for a time zone, ticking every second. */
export function useClock(timeZone) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(now);
}
