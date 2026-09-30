import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react';
import { useEffect, useState } from 'react';
import { hasFinePointer } from '../hooks.js';

/**
 * A soft light that follows the cursor. It is one small layer moved with
 * transforms — repainting a full-screen gradient on every mouse move is what
 * makes this kind of effect expensive.
 */
export default function Spotlight() {
  const reduce = useReducedMotion();
  const [on, setOn] = useState(false);
  const x = useMotionValue(-600);
  const y = useMotionValue(-600);
  const sx = useSpring(x, { stiffness: 90, damping: 22, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 90, damping: 22, mass: 0.6 });

  useEffect(() => { setOn(hasFinePointer() && !reduce); }, [reduce]);
  useEffect(() => {
    if (!on) return;
    const move = (e) => { x.set(e.clientX); y.set(e.clientY); };
    window.addEventListener('pointermove', move, { passive: true });
    return () => window.removeEventListener('pointermove', move);
  }, [on, x, y]);

  if (!on) return null;
  return (
    <motion.div
      aria-hidden="true"
      style={{ x: sx, y: sy, translateX: '-50%', translateY: '-50%' }}
      className="pointer-events-none fixed left-0 top-0 z-[5] size-[34rem] rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--color-surf)_13%,transparent),transparent)] will-change-transform"
    />
  );
}
