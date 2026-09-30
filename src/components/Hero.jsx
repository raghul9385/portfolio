import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { profile, projects } from '../data.js';
import { EASE, hasFinePointer, useClock } from '../hooks.js';
import { HeroStage } from './Scene3DFrame.jsx';
import SystemWindow from './SystemWindow.jsx';
import { Button, Magnetic } from './ui.jsx';

function splitName() {
  let i = 0;
  const chars = (text, accent = false) => [...text].map((c) => ({ c: c === ' ' ? ' ' : c, i: i++, accent }));
  return [chars(profile.firstName), [...chars(profile.lastName), ...chars('.', true)]];
}
const NAME_LINES = splitName();

const letter = {
  hidden: { opacity: 0, y: '60%', rotate: 8, filter: 'blur(8px)' },
  show: (i) => ({ opacity: 1, y: '0%', rotate: 0, filter: 'blur(0px)', transition: { delay: 0.06 + i * 0.028, duration: 0.6, ease: EASE } }),
};

const BUILD_LOG = [
  ['$', 'eas build --platform all', 'cmd'],
  ['✓', 'KidCheck · React Native + ASP.NET · iOS & Android', 'ok'],
  ['✓', 'Mountain Rose Herbs · storefront app · offline-ready', 'ok'],
  ['✓', '5 client websites shipped at Wikpolt Softwares', 'ok'],
  ['›', 'open to full-time, contract and freelance work', 'note'],
];

function FadeUp({ as = 'div', delay, className, children }) {
  const M = motion[as];
  return (
    <M className={className} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.55, ease: EASE }}>
      {children}
    </M>
  );
}

function RotatingWord({ words }) {
  const [index, setIndex] = useState(0);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setIndex((n) => (n + 1) % words.length), 2800);
    return () => clearInterval(id);
  }, [words, reduce]);
  return (
    <span className="inline-block whitespace-nowrap text-surf">
      <AnimatePresence mode="wait">
        <motion.span key={words[index]} className="inline-block"
          initial={{ y: '55%', opacity: 0, filter: 'blur(6px)' }} animate={{ y: '0%', opacity: 1, filter: 'blur(0px)' }}
          exit={{ y: '-55%', opacity: 0, filter: 'blur(6px)' }} transition={{ duration: 0.4, ease: EASE }}>
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/** Reveals the log a character at a time, like a real build running. */
function useTypedLog(lines, { start = 0.5, speed = 42 } = {}) {
  const reduce = useReducedMotion();
  const [row, setRow] = useState(reduce ? lines.length : 0);
  const [col, setCol] = useState(0);

  useEffect(() => {
    if (reduce) return;
    let raf;
    let t0;
    const total = lines.map(([, text]) => text.length);
    const step = (now) => {
      t0 ??= now;
      const elapsed = (now - t0) / 1000 - start;
      if (elapsed > 0) {
        let typed = Math.floor(elapsed * speed);
        let r = 0;
        while (r < lines.length && typed > total[r] + 4) { typed -= total[r] + 4; r++; }
        setRow(r);
        setCol(Math.min(typed, total[r] ?? 0));
      }
      if (elapsed < 30) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [lines, reduce, start, speed]);

  return { row, col, done: row >= lines.length };
}

function BuildLog() {
  const { row, col, done } = useTypedLog(BUILD_LOG);
  return (
    <FadeUp delay={0.46} className="relative max-w-[48ch] overflow-hidden rounded-xl border border-line bg-ink-2/85 shadow-[0_24px_60px_-30px_rgb(3_16_28/0.9)] backdrop-blur-md">
      <div className="flex items-center gap-1.5 border-b border-line px-3 py-2">
        {['bg-line-2', 'bg-line-2', 'bg-surf'].map((c, i) => <i key={i} className={`size-2 rounded-full ${c}`} />)}
        <span className="label-mono ml-2 text-dim">~/raghul-babu — build</span>
        <span className="label-mono ml-auto text-surf">{done ? 'passing' : 'running…'}</span>
      </div>
      <div className="grid min-h-[7.5rem] gap-1.5 p-3 font-mono text-[11.5px] leading-snug">
        {BUILD_LOG.map(([mark, text, kind], i) => {
          if (i > row) return null;
          const shown = i < row ? text : text.slice(0, col);
          return (
            <p key={text} className="flex gap-2">
              <span className={kind === 'ok' ? 'text-surf' : kind === 'cmd' ? 'text-glow' : 'text-dim'}>{mark}</span>
              <span className={kind === 'cmd' ? 'text-paper' : 'text-muted'}>
                {shown}
                {i === row && <span className="ml-0.5 inline-block h-3 w-1.5 translate-y-0.5 animate-blink bg-surf" />}
              </span>
            </p>
          );
        })}
      </div>
    </FadeUp>
  );
}

/** Anime speed lines sweeping across the hero. */
function SpeedLines() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[2] overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_20%,#000_80%,transparent)]">
      {[8, 22, 34, 47, 58, 71, 84].map((top, i) => (
        <span key={top} className="absolute h-px w-[42%] animate-streak bg-gradient-to-r from-transparent via-surf/45 to-transparent"
          style={{ top: `${top}%`, animationDelay: `${i * 1.1}s`, animationDuration: `${5 + (i % 3) * 1.6}s` }} />
      ))}
    </div>
  );
}

/** Small twinkles, the way anime keyframes sparkle. */
function Sparkles() {
  const spots = [[14, 26], [23, 62], [38, 18], [46, 74], [57, 35], [68, 58], [77, 22], [88, 66], [93, 40]];
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[2]">
      {spots.map(([left, top], i) => (
        <span key={`${left}-${top}`}
          className="absolute size-2 animate-twinkle bg-surf-2 [clip-path:polygon(50%_0,60%_40%,100%_50%,60%_60%,50%_100%,40%_60%,0_50%,40%_40%)]"
          style={{ left: `${left}%`, top: `${top}%`, animationDelay: `${i * 0.7}s` }} />
      ))}
    </div>
  );
}

export default function Hero() {
  const heroRef = useRef(null);
  const nameRef = useRef(null);
  const reduce = useReducedMotion();
  const time = useClock(profile.timeZone);

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 160]);

  // Letters near the pointer swell along the variable font's weight axis.
  useEffect(() => {
    if (reduce || !hasFinePointer()) return;
    const hero = heroRef.current;
    const chars = [...nameRef.current.querySelectorAll('.ch')];
    let px = 0, py = 0, pending = false;
    const update = () => {
      pending = false;
      for (const ch of chars) {
        const r = ch.getBoundingClientRect();
        const d = Math.hypot(px - (r.left + r.width / 2), py - (r.top + r.height / 2));
        ch.style.fontVariationSettings = `"wght" ${Math.round(560 + 240 * Math.max(0, 1 - d / 300))}, "opsz" 96`;
      }
    };
    const move = (e) => { px = e.clientX; py = e.clientY; if (!pending) { pending = true; requestAnimationFrame(update); } };
    const leave = () => chars.forEach((ch) => { ch.style.fontVariationSettings = ''; });
    hero.addEventListener('pointermove', move);
    hero.addEventListener('pointerleave', leave);
    return () => { hero.removeEventListener('pointermove', move); hero.removeEventListener('pointerleave', leave); };
  }, [reduce]);

  return (
    <header id="top" ref={heroRef} className="relative min-h-[78vh] overflow-hidden border-b border-line pb-12 pt-[calc(112px+env(safe-area-inset-top,0px))] md:pt-[calc(150px+env(safe-area-inset-top,0px))]">
      <HeroStage className="absolute inset-0 z-0" />
      <SpeedLines />
      <Sparkles />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(75%_60%_at_18%_45%,var(--color-ink)_18%,transparent_72%)] opacity-90" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-40 bg-gradient-to-t from-ink to-transparent" />

      <motion.div style={reduce ? undefined : { y }} className="pointer-events-none relative z-10 [&_a]:pointer-events-auto [&_button]:pointer-events-auto">
        <div className="wrap grid max-w-[1200px] gap-6">
          <FadeUp as="p" delay={0.05} className="label-mono inline-flex w-fit items-center gap-3 rounded-full border border-line-2 bg-ink-2/70 py-1.5 pl-2.5 pr-3.5 uppercase text-muted backdrop-blur-md">
            <span className="size-2 animate-ping-live rounded-full bg-surf" />{profile.availability}
          </FadeUp>

          <h1 ref={nameRef} aria-label={`${profile.firstName} ${profile.lastName}`}
            className="cursor-default select-none text-[clamp(3.25rem,10vw,8rem)] font-[560] leading-[.86] tracking-[-.045em] [font-variation-settings:'wght'_560,'opsz'_96] [text-shadow:0_8px_40px_rgb(4_24_42/0.55)]">
            {NAME_LINES.map((line, li) => (
              <span key={li} className="block whitespace-nowrap">
                {line.map(({ c, i, accent }) => (
                  <motion.span key={i} custom={i} variants={letter} initial="hidden" animate="show" aria-hidden="true"
                    className={`ch inline-block transition-[font-variation-settings] duration-300 ease-expo ${accent ? 'animate-glow-pulse text-surf' : ''}`}>
                    {c}
                  </motion.span>
                ))}
              </span>
            ))}
          </h1>

          <FadeUp as="p" delay={0.32} className="font-display text-[clamp(1.2rem,2.7vw,2rem)] font-[450] leading-tight tracking-tight">
            {profile.role} <RotatingWord words={profile.rotatingWords} />
          </FadeUp>
          <FadeUp as="p" delay={0.4} className="max-w-[48ch] text-[clamp(1rem,1.3vw,1.0625rem)] text-muted">{profile.lede}</FadeUp>
          <FadeUp delay={0.48} className="flex flex-wrap gap-3">
            <Magnetic><Button href="#work">See selected work <span className="transition-transform duration-500 ease-expo group-hover:translate-x-1 group-hover:-rotate-45">→</span></Button></Magnetic>
            <Magnetic><Button variant="ghost" href="#contact">Start a conversation</Button></Magnetic>
          </FadeUp>
          <div className="flex flex-wrap items-start gap-5">
            <BuildLog />
            <SystemWindow />
          </div>
        </div>

        <div className="wrap max-w-[1200px]">
          <FadeUp delay={0.6} className="label-mono mt-12 grid grid-cols-2 gap-4 border-t border-line pt-4 uppercase text-dim md:mt-16 lg:grid-cols-4 [&_span]:mt-0.5 [&_span]:block [&_span]:font-sans [&_span]:text-sm [&_span]:normal-case [&_span]:tracking-normal [&_span]:text-paper">
            <div>Local time (IST)<span className="tabular-nums">{time}</span></div>
            <div>Based in<span>{profile.location}</span></div>
            <div>Daily stack<span>{profile.dailyStack}</span></div>
            <div>
              <a href="#about" className="inline-flex items-center gap-2 text-inherit no-underline"><b className="inline-block h-4.5 w-px animate-cue bg-gradient-to-b from-surf to-transparent" />Scroll</a>
              <span>{projects.length} featured apps below</span>
            </div>
          </FadeUp>
        </div>
      </motion.div>

      <p className="label-mono pointer-events-none absolute bottom-4 right-4 z-10 rounded-full border border-line-2 bg-ink/70 px-3 py-1.5 text-dim backdrop-blur">
        move your cursor · live 3D
      </p>
    </header>
  );
}
