import { animate, motion, useInView, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { EASE, useToast } from '../hooks.js';

const cx = (...c) => c.filter(Boolean).join(' ');

/** Fades and lifts its children in the first time they scroll into view. */
export function Reveal({ as = 'div', delay = 0, y = 16, className, children, ...rest }) {
  const M = motion[as];
  return (
    <M className={className} initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }} transition={{ duration: 0.45, ease: EASE, delay }} {...rest}>
      {children}
    </M>
  );
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
      <span aria-hidden="true" className="absolute inset-0 -z-10 translate-y-full rounded-full bg-paper transition-transform duration-300 ease-expo group-hover:translate-y-0 group-focus-visible:translate-y-0" />
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
  const corner = 'absolute size-3.5 border-surf/45 transition-colors duration-300 group-hover:border-surf';
  return (
    <span aria-hidden="true" className={`pointer-events-none absolute inset-0 ${className}`}>
      <span className={`${corner} left-2 top-2 border-l border-t`} />
      <span className={`${corner} right-2 top-2 border-r border-t`} />
      <span className={`${corner} bottom-2 left-2 border-b border-l`} />
      <span className={`${corner} bottom-2 right-2 border-b border-r`} />
    </span>
  );
}

export function SectionHead({ path, title, muted, id, index }) {
  return (
    <div className="mb-12 grid gap-4 md:mb-16">
      <div className="flex flex-wrap items-center gap-3">
        {index && <span className="system-window label-mono border border-surf/45 bg-ink-2/90 px-2.5 py-1 tabular-nums tracking-[.18em] text-surf">[ Quest {index} ]</span>}
        <p className="label-mono flex items-center gap-3 text-surf">{path}</p>
        <span aria-hidden="true" className="h-px flex-1 bg-gradient-to-r from-surf/60 to-transparent" />
      </div>
      <h2 id={id} className="max-w-[18ch] text-[clamp(2.25rem,5.2vw,4rem)] font-semibold">
        {title} {muted && <em className="font-normal not-italic text-muted">{muted}</em>}
      </h2>
    </div>
  );
}
