import { motion } from 'motion/react';
import { EASE, useTilt, useToast } from '../hooks.js';

const cx = (...classes) => classes.filter(Boolean).join(' ');

/** Folds its children up into place, in 3D, the first time they scroll into view. */
export function Reveal({ as = 'div', delay = 0, className, children, ...rest }) {
  const Component = motion[as];
  return (
    <Component
      className={className}
      initial={{ opacity: 0, y: 28, rotateX: 12, transformPerspective: 1200 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.6, ease: EASE, delay }}
      {...rest}
    >
      {children}
    </Component>
  );
}

/**
 * A panel that leans toward the mouse, with a soft glare that follows it.
 * Children marked with `depth-*` classes float above the surface.
 */
export function Tilt({ as: Tag = 'div', max = 7, scope, className, children, ...rest }) {
  const ref = useTilt({ max, scope });
  return (
    <Tag ref={ref} className={cx('tilt', className)} {...rest}>
      {children}
    </Tag>
  );
}

const BUTTON = {
  base: 'group inline-flex items-center gap-2.5 rounded-full border text-sm leading-none font-semibold no-underline transition duration-200 cursor-pointer disabled:cursor-not-allowed',
  primary: 'btn-3d border-accent bg-accent text-accent-ink hover:border-accent-2 hover:bg-accent-2',
  ghost: 'border-line-2 bg-ink/40 text-paper hover:border-accent hover:text-accent',
  md: 'px-6 py-3.5',
  sm: 'px-4 py-2.5',
};

/** Pill button. Renders an <a> when given `href`. */
export function Button({ variant = 'primary', size = 'md', href, className, children, ...rest }) {
  const Tag = href ? 'a' : 'button';
  return (
    <Tag
      href={href}
      className={cx(BUTTON.base, BUTTON[variant], BUTTON[size], className)}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/** Anchor that shows a reminder toast instead of navigating while `href` is still empty. */
export function SmartLink({ href, placeholder = 'Add this link', children, ...rest }) {
  const toast = useToast();

  if (href) {
    const external = /^https?:/.test(href);
    return (
      <a
        href={href}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        {...rest}
      >
        {children}
      </a>
    );
  }

  return (
    <a
      href="#"
      onClick={(event) => {
        event.preventDefault();
        toast(`${placeholder} in src/data.js`);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}

export function SectionHead({ index, label, title, muted, id }) {
  return (
    <div className="relative mb-12 grid gap-4 md:mb-16">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-[0.42em] right-0 text-[clamp(5rem,14vw,11rem)] leading-none font-bold tracking-[-.06em] text-outline select-none"
      >
        {index}
      </span>
      <p className="relative flex items-center gap-3 label-mono text-accent">
        <span className="tabular-nums">{index}</span>
        <span className="h-px w-8 bg-accent/50" aria-hidden="true" />
        <span className="text-dim uppercase">{label}</span>
      </p>
      <h2 id={id} className="relative max-w-[20ch] text-[clamp(2rem,4.6vw,3.5rem)] font-semibold">
        {title} {muted && <span className="font-normal text-muted">{muted}</span>}
      </h2>
    </div>
  );
}
