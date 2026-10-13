import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { experience, profile, projects } from '../data.js';
import { EASE, useClock } from '../hooks.js';
import HeroStage from './HeroStage.jsx';
import { Button, Tilt } from './ui.jsx';

/** One-time entrance: fade and lift on first paint. */
function FadeUp({ as = 'div', delay = 0, className, children }) {
  const Component = motion[as];
  return (
    <Component
      className={className}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6, ease: EASE }}
    >
      {children}
    </Component>
  );
}

/** Ticks on its own so the rest of the hero doesn't re-render every second. */
function LocalTime() {
  return <span className="tabular-nums">{useClock(profile.timeZone)}</span>;
}

export default function Hero() {
  const current = experience[0];
  const facts = [
    ['Local time (IST)', <LocalTime key="time" />],
    ['Based in', profile.location],
    ['Daily stack', profile.dailyStack],
    ['Shipped', `${projects.length} production apps`],
  ];

  return (
    <header
      id="top"
      className="relative flex min-h-[100svh] flex-col justify-center pt-[calc(120px+env(safe-area-inset-top,0px))] pb-16"
    >
      <div className="wrap grid items-center gap-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-10">
        <div className="grid gap-6">
          <FadeUp
            as="p"
            className="inline-flex w-fit items-center gap-2.5 rounded-full border border-line-2 bg-ink/60 px-3.5 py-1.5 text-sm text-muted"
          >
            <span
              aria-hidden="true"
              className="size-2 rounded-full bg-accent shadow-[0_0_10px_var(--color-accent)]"
            />
            {profile.availability || `${current.role} at ${current.org}`}
          </FadeUp>

          <FadeUp
            as="h1"
            delay={0.05}
            className="text-[clamp(3.25rem,8vw,6.75rem)] leading-[.92] font-bold tracking-[-.05em]"
          >
            <span className="block text-3d">{profile.firstName}</span>{' '}
            <span className="block text-aurora pb-[.08em]">{profile.lastName}</span>
          </FadeUp>

          <FadeUp
            as="p"
            delay={0.1}
            className="text-[clamp(1.2rem,2.3vw,1.65rem)] leading-snug font-medium tracking-tight"
          >
            <span className="text-accent">{profile.role}.</span>{' '}
            <span className="text-paper/90">{profile.headline}</span>
          </FadeUp>

          <FadeUp as="p" delay={0.15} className="max-w-[54ch] text-muted">
            {profile.lede}
          </FadeUp>

          <FadeUp delay={0.2} className="flex flex-wrap gap-3 pt-2">
            <Button href="#work">
              View my work
              <ArrowRight
                size={16}
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </Button>
            <Button variant="ghost" href="#contact">
              Get in touch
            </Button>
          </FadeUp>
        </div>

        <FadeUp delay={0.15} className="w-full">
          <HeroStage />
        </FadeUp>
      </div>

      <div className="wrap">
        <FadeUp delay={0.3} className="mt-16 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {facts.map(([label, value]) => (
            <Tilt key={label} max={10} className="card glass px-5 py-4">
              <p className="label-mono text-dim uppercase">{label}</p>
              <p className="depth-1 mt-1 text-sm text-paper">{value}</p>
            </Tilt>
          ))}
        </FadeUp>
      </div>
    </header>
  );
}
