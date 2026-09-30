import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { about, experience, profile, projects, websites } from '../data.js';
import { EASE } from '../hooks.js';
import { Brackets } from './ui.jsx';

/** Answers are written from the same data as the rest of the page — nothing is invented here. */
const QA = [
  {
    q: 'What does he build?',
    a: () => `Mobile apps and the web front ends around them. Right now: ${projects.map((p) => `${p.title} (${p.kind.toLowerCase()})`).join(', ')}. Before that, ${websites.length} client websites at Wikpolt Softwares.`,
  },
  {
    q: 'Which stack?',
    a: () => `${profile.dailyStack} day to day — React Native with Expo and Redux Toolkit on mobile, React on the web, C# / ASP.NET and SQL Server behind them.`,
  },
  {
    q: 'What is he doing now?',
    a: () => `${experience[0].role} at ${experience[0].org}, ${experience[0].dates.toLowerCase()}. ${experience[0].summary}`,
  },
  {
    q: profile.availability ? 'Is he available?' : 'How do I reach him?',
    a: () => `${profile.availability ? `${profile.availability}. ` : ''}Based in ${profile.location}. The fastest route is ${profile.email} — he replies within a working day.`,
  },
  {
    q: 'How does he work?',
    a: () => about.principles.slice(0, 3).join(' '),
  },
];

const THINKING = 520;

/** An assistant-style panel: pick a question, watch the answer stream in. */
export default function AskPanel() {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState('thinking');
  const [shown, setShown] = useState('');
  const timers = useRef([]);

  const answer = QA[index].a();

  useEffect(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];

    if (reduce) {
      setPhase('done');
      setShown(answer);
      return;
    }

    setPhase('thinking');
    setShown('');
    let raf;
    const think = setTimeout(() => {
      setPhase('streaming');
      const t0 = performance.now();
      const step = (now) => {
        const chars = Math.floor(((now - t0) / 1000) * 58);
        setShown(answer.slice(0, chars));
        if (chars < answer.length) raf = requestAnimationFrame(step);
        else setPhase('done');
      };
      raf = requestAnimationFrame(step);
    }, THINKING);
    timers.current.push(think);

    return () => {
      clearTimeout(think);
      cancelAnimationFrame(raf);
    };
  }, [answer, reduce]);

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-line bg-ink-2/85">
      <Brackets />
      <header className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-3">
        <span className="flex items-center gap-2 label-mono uppercase tracking-[.16em] text-surf">
          <Sparkles size={13} /> assistant
        </span>
        <span className="label-mono text-dim">scripted answers · built from this page’s data, not a live model</span>
        <motion.span aria-hidden="true" className="ml-auto size-1.5 rounded-full bg-surf"
          />
      </header>

      <div className="grid gap-5 p-5 md:grid-cols-[minmax(0,260px)_1fr] md:p-6">
        <div className="grid content-start gap-2" role="group" aria-label="Questions">
          {QA.map((item, i) => (
            <button
              key={item.q} type="button" onClick={() => setIndex(i)} aria-pressed={i === index}
              className={`relative isolate w-full cursor-pointer rounded-lg border px-3.5 py-2.5 text-left text-sm transition-colors duration-300 ${
                i === index ? 'border-surf/50 bg-ink-3 text-paper' : 'border-line text-muted hover:border-line-2 hover:text-paper'
              }`}
            >
              <span className="label-mono mr-2 text-surf">{String(i + 1).padStart(2, '0')}</span>
              {item.q}
            </button>
          ))}
        </div>

        <div className="min-h-[9.5rem] rounded-lg border border-line bg-ink/60 p-4">
          <p className="label-mono mb-2 uppercase tracking-[.14em] text-dim">
            <span className="text-surf">›</span> {QA[index].q}
          </p>
          <AnimatePresence mode="wait">
            {phase === 'thinking' ? (
              <motion.p key="thinking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex items-center gap-1.5 text-muted">
                {[0, 1, 2].map((i) => (
                  <motion.span key={i} className="size-1.5 rounded-full bg-surf"
                    animate={{ opacity: [0.25, 1, 0.25], y: [0, -3, 0] }}
                    transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }} />
                ))}
              </motion.p>
            ) : (
              <motion.p key={`answer-${index}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25, ease: EASE }}
                className="text-[15px] leading-relaxed text-paper">
                {shown}
                {phase === 'streaming' && <span className="ml-0.5 inline-block h-4 w-1.5 translate-y-0.5 animate-blink bg-surf" />}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
