import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react';
import { useEffect, useState } from 'react';
import { hasFinePointer, usePalette } from '../hooks.js';

const SIZES = { idle: 36, hover: 58, label: 86 };

/** Trailing ring + dot. Grows over interactive elements; shows a label over [data-cursor] targets. */
export default function Cursor() {
  const reduce = useReducedMotion();
  const palette = usePalette();
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState('idle');
  const [text, setText] = useState('');
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 350, damping: 30, mass: 0.6 });
  const ringY = useSpring(y, { stiffness: 350, damping: 30, mass: 0.6 });

  useEffect(() => { setEnabled(hasFinePointer() && !reduce); }, [reduce]);

  useEffect(() => {
    if (!enabled) return;
    const move = (e) => { x.set(e.clientX); y.set(e.clientY); setVisible(true); };
    const leave = () => setVisible(false);
    const over = (e) => {
      const lab = e.target.closest('[data-cursor]');
      const hov = e.target.closest('a,button,input,textarea,select,li');
      setMode(lab ? 'label' : hov ? 'hover' : 'idle');
      if (lab) setText(lab.dataset.cursor);
    };
    window.addEventListener('pointermove', move);
    document.documentElement.addEventListener('pointerleave', leave);
    document.addEventListener('pointerover', over);
    return () => {
      window.removeEventListener('pointermove', move);
      document.documentElement.removeEventListener('pointerleave', leave);
      document.removeEventListener('pointerover', over);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;
  const size = SIZES[mode];

  return (
    <>
      <motion.div aria-hidden="true" style={{ x: ringX, y: ringY, translateX: '-50%', translateY: '-50%' }}
        animate={{ width: size, height: size, opacity: visible ? 1 : 0, backgroundColor: mode === 'label' ? 'rgb(63 224 200 / 1)' : mode === 'hover' ? 'rgb(63 224 200 / 0.12)' : 'rgb(63 224 200 / 0)' }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="pointer-events-none fixed left-0 top-0 z-[250] grid place-items-center rounded-full border border-surf/75">
        {palette === 'monarch' && (
          <motion.svg viewBox="0 0 48 48" className="absolute inset-[-8px] size-[calc(100%+16px)] text-surf/70"
            animate={reduce ? undefined : { rotate: 360 }} transition={{ duration: 9, repeat: Infinity, ease: 'linear' }}>
            <circle cx="24" cy="24" r="21" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 7" />
            <circle cx="24" cy="24" r="15" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="1 5" opacity="0.7" />
          </motion.svg>
        )}
        <AnimatePresence>
          {mode === 'label' && (
            <motion.span key={text} initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }}
              className="font-mono text-[10px] font-semibold uppercase tracking-[.08em] text-surf-ink">
              {text}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
      <motion.div aria-hidden="true" style={{ x, y, translateX: '-50%', translateY: '-50%' }} animate={{ opacity: visible ? 1 : 0 }}
        className="pointer-events-none fixed left-0 top-0 z-[251] size-1.5 rounded-full bg-surf" />
    </>
  );
}
