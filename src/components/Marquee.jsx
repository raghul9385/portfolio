import { motion, useAnimationFrame, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, useVelocity } from 'motion/react';
import { useRef } from 'react';
import { marquee, skills } from '../data.js';

const wrap = (min, max, v) => { const r = max - min; return ((((v - min) % r) + r) % r) + min; };

/** A row that drifts on its own and speeds up / reverses with scroll velocity. */
function Row({ items, baseVelocity, outline = false }) {
  const reduce = useReducedMotion();
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
  const factor = useTransform(velocity, [0, 1000], [0, 5], { clamp: false });
  const skew = useTransform(velocity, [-3000, 3000], [8, -8]);
  const x = useTransform(baseX, (v) => `${wrap(-50, 0, v)}%`);
  const direction = useRef(1);

  useAnimationFrame((_, delta) => {
    if (reduce) return;
    let moveBy = direction.current * baseVelocity * (delta / 1000);
    if (factor.get() < 0) direction.current = -1;
    else if (factor.get() > 0) direction.current = 1;
    moveBy += direction.current * moveBy * factor.get();
    baseX.set(baseX.get() + moveBy);
  });

  const list = (hidden) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center gap-12 pr-12">
      {items.map((t) => (
        <li key={t} className={`flex items-center gap-12 whitespace-nowrap font-display text-[clamp(1.75rem,4vw,3rem)] font-medium tracking-tight transition-colors duration-300 after:text-[.45em] after:text-surf after:content-['✦'] ${outline ? 'text-outline hover:[-webkit-text-stroke-color:var(--color-surf)]' : 'text-dim hover:text-paper'}`}>
          {t}
        </li>
      ))}
    </ul>
  );

  return (
    <motion.div className="flex w-max" style={{ x, skewX: reduce ? 0 : skew }}>
      {list(false)}{list(true)}
    </motion.div>
  );
}

export default function Marquee() {
  const second = skills.flatMap((s) => s.items).filter((t) => !marquee.includes(t)).slice(0, 10);
  return (
    <div aria-label="Technologies I work with" className="grid gap-3 overflow-hidden border-y border-line bg-ink/60 py-7 [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]">
      <Row items={marquee} baseVelocity={-2} />
      <Row items={second} baseVelocity={2} outline />
    </div>
  );
}
