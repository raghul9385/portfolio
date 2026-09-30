import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';
import { experience, profile, projects } from '../data.js';
import { EASE, useClock } from '../hooks.js';
import HeroStage from './HeroStage.jsx';
import ShadowArmy from './ShadowArmy.jsx';
import { Button } from './ui.jsx';

function FadeUp({ as = 'div', delay, className, children }) {
  const M = motion[as];
  return (
    <M className={className} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.5, ease: EASE }}>
      {children}
    </M>
  );
}

function RotatingWord({ words }) {
  const [index, setIndex] = useState(0);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setIndex((n) => (n + 1) % words.length), 3200);
    return () => clearInterval(id);
  }, [words, reduce]);
  return (
    <span className="inline-block whitespace-nowrap text-surf">
      <AnimatePresence mode="wait">
        <motion.span key={words[index]} className="inline-block"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/** Ticks on its own so the rest of the hero does not re-render every second. */
function LocalTime() {
  return <span className="tabular-nums">{useClock(profile.timeZone)}</span>;
}

export default function Hero() {
  return (
    <header id="top" className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden border-b border-line pb-32 pt-[calc(104px+env(safe-area-inset-top,0px))]">
      <ShadowArmy />
      <div className="wrap relative z-10 grid items-center gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-8">
        <div className="grid gap-6">
          <FadeUp as="p" delay={0} className="system-window label-mono inline-flex w-fit items-center gap-3 border border-surf/45 bg-ink-2/90 px-3.5 py-1.5 uppercase text-muted">
            <span className="text-surf">[ System ]</span>
            {profile.availability || `${experience[0].role} · ${experience[0].org}`}
          </FadeUp>

          <FadeUp as="h1" delay={0.05} className="text-[clamp(3.25rem,8vw,7rem)] font-semibold leading-[.88] tracking-[-.045em]">
            <span className="block">{profile.firstName}</span>
            <span className="block">{profile.lastName}<span className="text-surf">.</span></span>
          </FadeUp>

          <FadeUp as="p" delay={0.12} className="font-display text-[clamp(1.2rem,2.2vw,1.65rem)] font-[450] leading-tight tracking-tight">
            {profile.role} <RotatingWord words={profile.rotatingWords} />
          </FadeUp>
          <FadeUp as="p" delay={0.18} className="max-w-[50ch] text-[clamp(1rem,1.25vw,1.0625rem)] text-muted">{profile.lede}</FadeUp>
          <FadeUp delay={0.24} className="flex flex-wrap gap-3 pt-1">
            <Button href="#work">See selected work <span className="transition-transform duration-300 group-hover:translate-x-1">→</span></Button>
            <Button variant="ghost" href="#contact">Start a conversation</Button>
          </FadeUp>
        </div>

        <FadeUp delay={0.2} className="w-full">
          <HeroStage />
        </FadeUp>
      </div>

      <div className="wrap relative z-10">
        <FadeUp delay={0.35} className="label-mono mt-12 grid grid-cols-2 gap-4 border-t border-line pt-4 uppercase text-dim lg:mt-14 lg:grid-cols-4 [&_span]:mt-0.5 [&_span]:block [&_span]:font-sans [&_span]:text-sm [&_span]:normal-case [&_span]:tracking-normal [&_span]:text-paper">
          <div>Local time (IST)<LocalTime /></div>
          <div>Based in<span>{profile.location}</span></div>
          <div>Daily stack<span>{profile.dailyStack}</span></div>
          <div>
            <a href="#about" className="text-inherit no-underline hover:text-surf">Scroll ↓</a>
            <span>{projects.length} featured apps below</span>
          </div>
        </FadeUp>
      </div>
    </header>
  );
}
