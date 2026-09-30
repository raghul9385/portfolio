import { useEffect, useRef } from 'react';
import { about } from '../data.js';
import { hasFinePointer, prefersReducedMotion } from '../hooks.js';
import { shot } from '../shots.js';

// [text, tone] per token; tones map to theme colours below
const CODE = [
  [['import ', 'kw'], ['{ useRoster } ', ''], ['from ', 'kw'], ["'@/hooks'", 'str'], [';', '']],
  [],
  [['export ', 'kw'], ['function ', 'kw'], ['CheckInScreen', 'fn'], ['() {', '']],
  [['  const ', 'kw'], ['{ kids, sync } = ', ''], ['useRoster', 'fn'], ['();', '']],
  [['  return ', 'kw'], ['(', '']],
  [['    <Screen ', 'tag'], ['offline ', 'attr'], ['onRefresh', 'attr'], ['={sync}>', '']],
  [['      <KidList ', 'tag'], ['data', 'attr'], ['={kids} ', ''], ['/>', 'tag']],
  [['    </Screen>', 'tag']],
  [['  );', '']],
  [['}', '']],
];
const TONE = { kw: 'text-glow', fn: 'text-surf-2', str: 'text-[#9ad48a]', tag: 'text-surf', attr: 'text-surf-2' };

// [label, position classes, depth px, bob delay s]
const CHIPS = [
  ['React', 'left-[0%] top-[4%]', 120, 0],
  ['TypeScript', 'right-[4%] top-[2%]', 60, 1.4],
  ['.NET', 'right-[0%] top-[74%]', 150, 0.7],
  ['SQL Server', 'left-[-2%] top-[56%]', 90, 2.1],
];

function Editor() {
  return (
    <div className="stage-panel stage-editor absolute left-[2%] top-[12%] w-[72%] overflow-hidden rounded-xl border border-line-2 bg-ink-2/95">
      <div className="flex items-center gap-1.5 border-b border-line bg-ink/80 px-3 py-2">
        {['bg-[#ff5f57]', 'bg-[#febc2e]', 'bg-[#28c840]'].map((c) => <i key={c} className={`size-2 rounded-full ${c}`} />)}
        <span className="label-mono ml-2 rounded bg-ink-3 px-2 py-0.5 text-[10px] text-paper">CheckInScreen.tsx</span>
        <span className="label-mono ml-auto hidden text-[10px] text-dim sm:inline">React Native</span>
      </div>
      <pre className="overflow-hidden p-3 font-mono text-[clamp(8.5px,1.05vw,11.5px)] leading-[1.7] text-muted">
        {CODE.map((line, i) => (
          <div key={i} className={i === 5 ? '-mx-3 bg-surf/8 px-3' : ''}>
            <span className="mr-3 inline-block w-4 text-right text-dim/60">{i + 1}</span>
            {line.map(([t, tone], j) => <span key={j} className={TONE[tone] ?? 'text-paper/85'}>{t}</span>)}
            {i === CODE.length - 1 && <span className="ml-0.5 inline-block h-[1.1em] w-[2px] translate-y-[2px] animate-blink bg-surf" />}
          </div>
        ))}
      </pre>
      <div className="label-mono flex items-center gap-3 whitespace-nowrap border-t border-line bg-ink/80 px-3 py-1.5 text-[9.5px] text-dim">
        <span className="text-surf">● main</span><span className="hidden sm:inline">TypeScript</span><span className="ml-auto text-surf">✓ build passing</span>
      </div>
    </div>
  );
}

function Phone() {
  const image = shot('kidcheck');
  return (
    <div className="stage-panel stage-phone absolute right-[3%] top-[26%] aspect-[9/19] w-[29%] rounded-[22px] border border-white/15 bg-ink p-[5px]">
      <div className="absolute left-1/2 top-2 z-10 h-1 w-8 -translate-x-1/2 rounded-full bg-black/80" />
      <div className="size-full overflow-hidden rounded-[17px] bg-ink-3">
        {image && <img src={image} alt="" className="size-full object-cover object-top" />}
      </div>
    </div>
  );
}

/** The System window — a small nod to Solo Leveling. */
function SystemCard() {
  return (
    <a href="#contact" className="stage-panel stage-system system-window absolute bottom-[0%] left-[20%] hidden w-[44%] border border-surf/45 bg-ink-2/95 no-underline sm:block">
      <p className="label-mono border-b border-surf/25 px-3 py-1.5 text-[10px] uppercase tracking-[.2em] text-surf">[ System ]</p>
      <div className="grid gap-0.5 px-3 py-2 text-[11.5px]">
        <p className="flex justify-between gap-3"><span className="label-mono text-[10px] uppercase text-dim">Level</span><span className="text-paper">{about.stats[0].value}{about.stats[0].suffix}</span></p>
        <p className="flex justify-between gap-3"><span className="label-mono text-[10px] uppercase text-dim">Class</span><span className="text-paper">Mobile &amp; Web Dev</span></p>
      </div>
      <p className="flex justify-between border-t border-surf/25 px-3 py-1.5 text-[11px] text-muted">
        <span><span className="label-mono mr-1.5 text-[10px] uppercase text-glow">Quest</span>Hire a developer</span>
        <span className="label-mono text-[10px] text-surf">Accept →</span>
      </p>
    </a>
  );
}

/**
 * A software engineer's desk in CSS 3D: editor, phone and tech chips at
 * different depths on a blueprint floor. Only transforms animate; loops
 * pause while the hero is off screen.
 */
export default function HeroStage() {
  const stage = useRef(null);
  const tilt = useRef(null);

  useEffect(() => {
    const el = stage.current;
    const io = new IntersectionObserver(([e]) => { el.dataset.paused = e.isIntersecting ? '' : 'true'; });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!hasFinePointer() || prefersReducedMotion()) return;
    const hero = stage.current.closest('header') ?? stage.current;
    const t = tilt.current;
    let raf = 0;
    const move = (e) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = stage.current.getBoundingClientRect();
        const x = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / r.width));
        const y = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / r.height));
        t.style.setProperty('--ry', `${(x * 12).toFixed(2)}deg`);
        t.style.setProperty('--rx', `${(-y * 8).toFixed(2)}deg`);
      });
    };
    const leave = () => { t.style.setProperty('--ry', '0deg'); t.style.setProperty('--rx', '0deg'); };
    hero.addEventListener('pointermove', move);
    hero.addEventListener('pointerleave', leave);
    return () => { cancelAnimationFrame(raf); hero.removeEventListener('pointermove', move); hero.removeEventListener('pointerleave', leave); };
  }, []);

  return (
    <div ref={stage} aria-hidden="true" className="stage relative mx-auto aspect-[1/0.9] w-[86%] max-w-[36rem] sm:w-full">
      {/* glow behind the scene */}
      <div className="absolute inset-[6%] rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--color-surf)_22%,transparent),transparent)]" />

      <div ref={tilt} className="stage-tilt absolute inset-0">
        <div className="stage-float absolute inset-0">
          {/* blueprint floor with a faint rune circle */}
          <div className="stage-floor absolute inset-x-[-8%] bottom-[-26%] h-[80%]">
            <svg viewBox="0 0 200 200" className="stage-rune absolute left-1/2 top-1/2 size-[70%] -translate-x-1/2 -translate-y-1/2 text-surf">
              <circle cx="100" cy="100" r="96" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.7" />
              <circle cx="100" cy="100" r="86" fill="none" stroke="currentColor" strokeWidth="6" strokeDasharray="1 9" opacity="0.5" />
              <circle cx="100" cy="100" r="62" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="18 6 3 6" opacity="0.6" />
              <path d="M100 44 L148 128 L52 128 Z M100 156 L52 72 L148 72 Z" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
            </svg>
          </div>

          <Editor />
          <Phone />
          <SystemCard />

          {CHIPS.map(([label, pos, z, delay]) => (
            <span key={label} className={`stage-chip label-mono absolute ${pos} rounded-full border border-surf/40 bg-ink-2/95 px-3 py-1.5 text-[11px] text-paper`}
              style={{ '--z': `${z}px`, animationDelay: `-${delay}s` }}>
              <span className="mr-1.5 text-surf">◆</span>{label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
