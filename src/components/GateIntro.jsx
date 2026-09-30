import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';
import { EASE, usePalette } from '../hooks.js';

const KEY = 'rb-gate-intro';

/** Gate-opening intro: the screen splits along a glowing rift, once per tab. */
export default function GateIntro() {
  const reduce = useReducedMotion();
  const palette = usePalette();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (reduce) return;
    let seen = false;
    try { seen = sessionStorage.getItem(KEY) === '1'; } catch { /* blocked storage */ }
    if (seen) return;
    setShow(true);
    try { sessionStorage.setItem(KEY, '1'); } catch { /* blocked storage */ }
    const id = setTimeout(() => setShow(false), 780);
    return () => clearTimeout(id);
  }, [reduce]);

  const label = palette === 'monarch' ? '⟪ Gate opening ⟫' : '⟪ Loading ⟫';

  return (
    <AnimatePresence>
      {show && (
        <motion.div key="gate" aria-hidden="true" className="animate-gate-clear pointer-events-none fixed inset-0 z-[500]"
          exit={{ opacity: 0 }} transition={{ duration: 0.35, ease: EASE }}>
          {/* the two halves sliding apart */}
          <motion.div className="absolute inset-y-0 left-0 w-1/2 bg-ink"
            initial={{ x: 0 }} animate={{ x: '-100%' }} transition={{ delay: 0.22, duration: 0.45, ease: [0.76, 0, 0.24, 1] }} />
          <motion.div className="absolute inset-y-0 right-0 w-1/2 bg-ink"
            initial={{ x: 0 }} animate={{ x: '100%' }} transition={{ delay: 0.22, duration: 0.45, ease: [0.76, 0, 0.24, 1] }} />

          {/* the rift itself */}
          <motion.div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-surf to-transparent shadow-[0_0_40px_10px] shadow-glow/50"
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: [0, 1, 1], opacity: [0, 1, 0] }}
            transition={{ duration: 0.7, times: [0, 0.35, 1], ease: EASE }} />

          <motion.p
            className="label-mono absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap uppercase tracking-[.3em] text-surf"
            initial={{ opacity: 0, letterSpacing: '0.1em' }}
            animate={{ opacity: [0, 1, 0], letterSpacing: '0.42em' }}
            transition={{ duration: 0.55, ease: EASE }}>
            {label}
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
