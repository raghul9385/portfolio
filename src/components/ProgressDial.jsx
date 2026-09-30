import { motion, useMotionValueEvent, useScroll, useSpring, useTransform } from 'motion/react';
import { useEffect, useState } from 'react';

const SECTIONS = [
  ['top', 'Intro'], ['about', 'About'], ['skills', 'Skills'],
  ['ask', 'Ask'], ['work', 'Work'], ['experience', 'Experience'], ['contact', 'Contact'],
];
const R = 21;
const C = 2 * Math.PI * R;

/** Reading position: a ring that fills, with the section you are in. */
export default function ProgressDial() {
  const { scrollYProgress } = useScroll();
  const smooth = useSpring(scrollYProgress, { stiffness: 140, damping: 26, restDelta: 0.001 });
  const dash = useTransform(smooth, (v) => `${v * C} ${C}`);
  const [percent, setPercent] = useState(0);
  const [active, setActive] = useState('Intro');

  useMotionValueEvent(smooth, 'change', (v) => setPercent(Math.round(v * 100)));

  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const found = SECTIONS.find(([id]) => id === e.target.id);
        if (found) setActive(found[1]);
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    SECTIONS.forEach(([id]) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, []);

  return (
    <motion.a
      href="#top" aria-label={`${percent}% read — back to top`}
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.6, duration: 0.8 }}
      className="group fixed bottom-6 right-6 z-40 hidden items-center gap-3 rounded-full border border-line bg-ink/70 py-1.5 pl-1.5 pr-4 no-underline backdrop-blur-md transition-colors duration-300 hover:border-line-2 lg:flex"
    >
      <span className="relative grid size-12 place-items-center">
        <svg viewBox="0 0 48 48" className="absolute inset-0 -rotate-90">
          <circle cx="24" cy="24" r={R} fill="none" stroke="var(--color-line)" strokeWidth="2" />
          <motion.circle cx="24" cy="24" r={R} fill="none" stroke="var(--color-surf)" strokeWidth="2" strokeLinecap="round"
            style={{ strokeDasharray: dash }} />
        </svg>
        <span className="label-mono text-[10px] tabular-nums text-paper">{percent}</span>
      </span>
      <span className="grid text-left leading-tight">
        <span className="label-mono text-[9.5px] uppercase text-dim">reading</span>
        <span className="text-sm font-medium text-paper">{active}</span>
      </span>
    </motion.a>
  );
}
