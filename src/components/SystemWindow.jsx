import { motion, useReducedMotion } from 'motion/react';
import { about, profile } from '../data.js';
import { EASE } from '../hooks.js';

const ROWS = [
  ['LEVEL', () => about.stats[0].value + about.stats[0].suffix.replace('+ yrs', '+ yrs')],
  ['CLASS', () => 'React / React Native Developer'],
  ['TITLE', () => 'UI Engineer'],
  ['GUILD', () => 'Cennest Technologies'],
  ['SKILLS', () => profile.dailyStack],
];

/** Status panel in the style of a game system notification. */
export default function SystemWindow({ className = '' }) {
  const reduce = useReducedMotion();
  const pop = reduce
    ? {}
    : {
        initial: { opacity: 0, scale: 0.92, filter: 'blur(6px)' },
        animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
        transition: { delay: 0.5, duration: 0.45, ease: EASE },
      };

  return (
    <motion.aside {...pop} aria-label="Status panel"
      className={`system-window relative w-full max-w-[22rem] border border-surf/40 bg-ink-2/85 backdrop-blur-md ${className}`}>
      <header className="flex items-center justify-between gap-3 border-b border-surf/25 px-4 py-2.5">
        <p className="label-mono uppercase tracking-[.18em] text-surf">[ System ]</p>
        <motion.span aria-hidden="true" animate={reduce ? undefined : { opacity: [0.35, 1, 0.35] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          className="size-1.5 rounded-full bg-surf shadow-[0_0_10px_2px] shadow-surf/60" />
      </header>

      <dl className="grid gap-2 px-4 py-3.5">
        {ROWS.map(([label, value], i) => (
          <motion.div key={label} className="flex items-baseline justify-between gap-4"
            initial={reduce ? undefined : { opacity: 0, x: -10 }}
            animate={reduce ? undefined : { opacity: 1, x: 0 }}
            transition={{ delay: 0.62 + i * 0.07, duration: 0.35, ease: EASE }}>
            <dt className="label-mono uppercase tracking-[.14em] text-dim">{label}</dt>
            <dd className="max-w-[62%] text-right text-[13px] font-medium text-paper">{value()}</dd>
          </motion.div>
        ))}
      </dl>

      <motion.footer
        initial={reduce ? undefined : { opacity: 0 }} animate={reduce ? undefined : { opacity: 1 }}
        transition={{ delay: 1, duration: 0.4 }}
        className="flex items-center gap-2 border-t border-surf/25 px-4 py-2.5">
        <span className="label-mono uppercase tracking-[.14em] text-glow">quest</span>
        <span className="text-[12.5px] text-muted">Hiring? The gate is open — let’s talk.</span>
      </motion.footer>
    </motion.aside>
  );
}
