import { animate, motion, useInView, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { EASE, useToast } from '../hooks.js';

const cx = (...c) => c.filter(Boolean).join(' ');

/** Fades and lifts its children in the first time they scroll into view. */
export function Reveal({ as = 'div', delay = 0, y = 30, className, children, ...rest }) {
  const M = motion[as];
  return (
    <M className={className} initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }} transition={{ duration: 0.55, ease: EASE, delay }} {...rest}>
      {children}
    </M>
  );
}

/** Springs toward the pointer while hovered (mouse only). */
export function Magnetic({ strength = 0.3, className = 'inline-block', children }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const x = useSpring(0, { stiffness: 220, damping: 15, mass: 0.3 });
  const y = useSpring(0, { stiffness: 220, damping: 15, mass: 0.3 });
  const move = (e) => {
    if (reduce || e.pointerType !== 'mouse') return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - r.left - r.width / 2) * strength);
    y.set((e.clientY - r.top - r.height / 2) * strength);
  };
  const leave = () => { x.set(0); y.set(0); };
  return <motion.div ref={ref} className={className} style={{ x, y }} onPointerMove={move} onPointerLeave={leave}>{children}</motion.div>;
}

const BTN = {
  base: 'group relative isolate inline-flex items-center gap-3 overflow-hidden rounded-full border font-semibold text-sm leading-none no-underline transition-colors duration-300 ease-expo hover:text-ink focus-visible:text-ink cursor-pointer',
  primary: 'border-surf bg-surf text-surf-ink',
  ghost: 'border-line-2 text-paper hover:border-paper',
  md: 'px-6 py-3.5',
  sm: 'px-4.5 py-2.5',
};

/** Pill button with a fill that sweeps up on hover. Renders <a> when given href. */
export function Button({ variant = 'primary', size = 'md', href, className, children, ...rest }) {
  const Tag = href ? 'a' : 'button';
  return (
    <Tag href={href} className={cx(BTN.base, BTN[variant], BTN[size], className)} {...rest}>
      <span aria-hidden="true" className="absolute inset-0 -z-10 translate-y-full rounded-full bg-paper transition-transform duration-500 ease-expo group-hover:translate-y-0 group-focus-visible:translate-y-0" />
      {children}
    </Tag>
  );
}

/** Anchor that toasts a reminder instead of navigating when `href` is still null. */
export function SmartLink({ href, placeholder = 'Add this link', children, ...rest }) {
  const toast = useToast();
  if (href) {
    const external = /^https?:/.test(href);
    return <a href={href} {...(external ? { target: '_blank', rel: 'noopener' } : {})} {...rest}>{children}</a>;
  }
  return (
    <a href="#" onClick={(e) => { e.preventDefault(); toast(`${placeholder} in src/data.js`); }} {...rest}>
      {children}
    </a>
  );
}

const GLYPHS = '!<>-_\\/[]{}—=+*^?#01';

/** Text that decodes from random glyphs the first time it scrolls into view. */
export function Scramble({ text }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(text);
  useEffect(() => {
    if (!inView || reduce) return;
    let raf;
    const t0 = performance.now();
    const run = (now) => {
      const k = Math.min(1, (now - t0) / 520);
      const cut = Math.floor(text.length * k);
      setShown(text.slice(0, cut) + [...text.slice(cut)].map((c) => (c === ' ' ? ' ' : GLYPHS[(Math.random() * GLYPHS.length) | 0])).join(''));
      if (k < 1) raf = requestAnimationFrame(run);
    };
    raf = requestAnimationFrame(run);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduce, text]);
  return (
    <span ref={ref}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">{shown}</span>
    </span>
  );
}

/** Counts up from zero when it enters view; shows the final value at rest. */
export function Counter({ value }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.8 });
  const reduce = useReducedMotion();
  const [n, setN] = useState(value);
  useEffect(() => {
    if (!inView || reduce) return;
    const controls = animate(0, value, { duration: 0.9, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => setN(Math.round(v)) });
    return () => controls.stop();
  }, [inView, reduce, value]);
  return <span ref={ref} className="tabular-nums">{n}</span>;
}

/** Blueprint corner marks — the engineering detail on a panel. */
export function Brackets({ className = '' }) {
  const corner = 'absolute size-3.5 border-surf/45 transition-colors duration-500 group-hover:border-surf';
  return (
    <span aria-hidden="true" className={`pointer-events-none absolute inset-0 ${className}`}>
      <span className={`${corner} left-2 top-2 border-l border-t`} />
      <span className={`${corner} right-2 top-2 border-r border-t`} />
      <span className={`${corner} bottom-2 left-2 border-b border-l`} />
      <span className={`${corner} bottom-2 right-2 border-b border-r`} />
    </span>
  );
}

/** Leans a panel in 3D toward the pointer. */
export function useTilt({ strength = 7, scale = 1.015 } = {}) {
  const reduce = useReducedMotion();
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const spring = { stiffness: 160, damping: 20 };
  const rotateX = useSpring(useTransform(my, [0, 1], [strength, -strength]), spring);
  const rotateY = useSpring(useTransform(mx, [0, 1], [-strength, strength]), spring);
  const onPointerMove = (e) => {
    if (reduce || e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  };
  const onPointerLeave = () => { mx.set(0.5); my.set(0.5); };
  return {
    handlers: { onPointerMove, onPointerLeave },
    style: { rotateX, rotateY, transformPerspective: 900 },
    whileHover: reduce ? undefined : { scale },
  };
}

export function SectionHead({ path, title, muted, id, index }) {
  return (
    <div className="mb-14 grid gap-4 md:mb-18">
      <div className="flex flex-wrap items-center gap-3">
        {index && <span className="label-mono rounded-md border border-line bg-ink-2/70 px-2 py-1 tabular-nums text-surf">{index}</span>}
        <p className="label-mono flex items-center gap-3 text-surf">{path}</p>
        <motion.span aria-hidden="true" className="h-px flex-1 origin-left bg-gradient-to-r from-surf/60 to-transparent"
          initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 0.7, ease: EASE }} />
      </div>
      <h2 id={id} className="max-w-[18ch] text-[clamp(2.25rem,5.2vw,4rem)] font-semibold">
        <Scramble text={title} /> {muted && <em className="font-normal not-italic text-muted"><Scramble text={muted} /></em>}
      </h2>
    </div>
  );
}
