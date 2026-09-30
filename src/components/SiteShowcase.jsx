import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { websites } from '../data.js';
import { EASE } from '../hooks.js';
import { shot } from '../shots.js';
import { Reveal } from './ui.jsx';

const HOLD = 6000;

/** Browser-framed preview of one site at a time, with a selectable list beside it. */
export default function SiteShowcase() {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const active = websites[index];
  const image = shot(active.shot);
  const domain = active.href.replace(/^https?:\/\//, '').replace(/\/$/, '');

  useEffect(() => {
    if (reduce || paused) return;
    const id = setTimeout(() => setIndex((n) => (n + 1) % websites.length), HOLD);
    return () => clearTimeout(id);
  }, [index, paused, reduce]);

  return (
    <div className="mt-24">
      <Reveal className="mb-10 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
        <div className="grid gap-3">
          <p className="label-mono flex items-center gap-3 uppercase text-surf before:h-px before:w-7 before:bg-current">
            Wikpolt Softwares · 2023 — 2024
          </p>
          <h3 className="text-[clamp(1.9rem,4.2vw,3.25rem)] font-semibold">
            Five sites, <span className="font-normal text-muted">live on the web.</span>
          </h3>
        </div>
        <p className="max-w-[34ch] text-sm text-muted">
          Client websites I built and launched. Pick one to preview it, or open the live site.
        </p>
      </Reveal>

      <div
        className="grid gap-6 lg:grid-cols-[1.45fr_1fr] lg:gap-8"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
      >
        {/* preview */}
        <Reveal className="overflow-hidden rounded-2xl border border-line bg-ink-2/92 shadow-[0_40px_80px_-40px_rgb(0_0_0/0.8)]">
          <div className="flex items-center gap-1.5 border-b border-line bg-ink px-3 py-2.5">
            {[0, 1, 2].map((i) => <i key={i} className="size-2 rounded-full bg-line-2" />)}
            <AnimatePresence mode="wait">
              <motion.span key={domain} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3 }}
                className="label-mono ml-2 truncate rounded-md bg-ink-3 px-2.5 py-1 text-[10.5px] text-muted">
                {domain}
              </motion.span>
            </AnimatePresence>
          </div>
          <div className="relative aspect-[16/10] max-w-full overflow-hidden bg-ink-3">
            <AnimatePresence mode="wait">
              <motion.img
                key={active.shot} src={image} alt={`${active.name} home page, first screen`} loading="lazy"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="absolute inset-0 size-full object-cover object-top"
              />
            </AnimatePresence>
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
            <a href={active.href} target="_blank" rel="noopener"
              className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full bg-surf px-4 py-2.5 text-sm font-semibold text-surf-ink no-underline transition-colors duration-300 hover:bg-surf-2">
              Visit live site <ArrowUpRight size={15} />
            </a>
          </div>
          <div className="grid gap-3 border-t border-line p-5 md:p-6">
            <AnimatePresence mode="wait">
              <motion.p key={active.name} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35, ease: EASE }}
                className="text-sm text-muted">
                {active.summary}
              </motion.p>
            </AnimatePresence>
            <ul className="flex flex-wrap gap-1.5" aria-label={`Technologies used on ${active.name}`}>
              {active.tech.map((t) => (
                <li key={`${active.name}-${t}`} className="rounded-md border border-line bg-ink-3 px-2.5 py-1.5 font-mono text-[11px] leading-none text-muted">
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        {/* selector */}
        <Reveal as="ul" delay={0.1} className="grid content-start gap-1.5">
          {websites.map((w, i) => {
            const on = i === index;
            return (
              <li key={w.href}>
                <button
                  type="button" onClick={() => setIndex(i)} onMouseEnter={() => setIndex(i)} onFocus={() => setIndex(i)}
                  aria-pressed={on} aria-label={`Preview ${w.name}`}
                  className="group relative isolate flex w-full cursor-pointer items-center gap-4 rounded-xl border border-transparent px-4 py-4 text-left transition-colors duration-300 hover:border-line"
                >
                  {on && <motion.span layoutId="site-active" aria-hidden="true" className="absolute inset-0 -z-10 rounded-xl border border-line-2 bg-ink-2/85" transition={{ type: 'spring', stiffness: 350, damping: 32 }} />}
                  <span className={`label-mono tabular-nums transition-colors ${on ? 'text-surf' : 'text-dim'}`}>0{i + 1}</span>
                  <span className="min-w-0 flex-1">
                    <span className={`block truncate font-display text-lg font-medium tracking-tight transition-colors ${on ? 'text-paper' : 'text-muted'}`}>{w.name}</span>
                    <span className="label-mono block truncate text-dim">{w.kind}</span>
                  </span>
                  <ArrowUpRight size={16} aria-hidden="true" className={`shrink-0 transition duration-500 ease-expo ${on ? 'text-surf' : 'text-dim'} group-hover:rotate-45`} />
                  {on && !reduce && !paused && (
                    <motion.span key={index} aria-hidden="true" className="absolute inset-x-4 bottom-1.5 h-px origin-left bg-surf/60"
                      initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: HOLD / 1000, ease: 'linear' }} />
                  )}
                </button>
              </li>
            );
          })}
        </Reveal>
      </div>
    </div>
  );
}
