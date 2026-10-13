import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { about, experience, profile, projects, websites } from '../data.js';
import { EASE } from '../hooks.js';

/** Answers are written from the same data as the rest of the page — nothing is invented here. */
const QA = [
  {
    q: 'What does he build?',
    a: () =>
      `Mobile apps and the web front ends around them. Right now: ${projects.map((p) => `${p.title} (${p.kind.toLowerCase()})`).join(', ')}. Before that, ${websites.length} client websites at Wikpolt Softwares.`,
  },
  {
    q: 'Which stack?',
    a: () =>
      `${profile.dailyStack} day to day — React Native with Expo and Redux Toolkit on mobile, React on the web, C# / ASP.NET and SQL Server behind them.`,
  },
  {
    q: 'What is he doing now?',
    a: () =>
      `${experience[0].role} at ${experience[0].org}, ${experience[0].dates.toLowerCase()}. ${experience[0].summary}`,
  },
  {
    q: profile.availability ? 'Is he available?' : 'How do I reach him?',
    a: () =>
      `${profile.availability ? `${profile.availability}. ` : ''}Based in ${profile.location}. The fastest route is ${profile.email} — he replies within a working day.`,
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

  const answer = QA[index].a();

  const pickQuestion = (i) => {
    if (i === index) return;
    setIndex(i);
    setPhase('thinking');
    setShown('');
  };

  // "Think" for a moment, then type the answer out at roughly 58 characters a second.
  useEffect(() => {
    if (reduce) return undefined;

    let frame;
    const thinking = setTimeout(() => {
      setPhase('streaming');
      const startedAt = performance.now();
      const step = (now) => {
        const chars = Math.floor(((now - startedAt) / 1000) * 58);
        setShown(answer.slice(0, chars));
        if (chars < answer.length) frame = requestAnimationFrame(step);
        else setPhase('done');
      };
      frame = requestAnimationFrame(step);
    }, THINKING);

    return () => {
      clearTimeout(thinking);
      cancelAnimationFrame(frame);
    };
  }, [answer, reduce]);

  // With reduced motion the whole answer shows straight away.
  const visiblePhase = reduce ? 'done' : phase;
  const visibleText = reduce ? answer : shown;

  return (
    <div className="overflow-hidden card">
      <header className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-3">
        <span className="flex items-center gap-2 label-mono tracking-[.16em] text-accent uppercase">
          <Sparkles size={13} /> assistant
        </span>
        <span className="label-mono text-dim">
          scripted answers · built from this page’s data, not a live model
        </span>
      </header>

      <div className="grid gap-5 p-5 md:grid-cols-[minmax(0,260px)_1fr] md:p-6">
        <div className="grid content-start gap-2" role="group" aria-label="Questions">
          {QA.map((item, i) => (
            <button
              key={item.q}
              type="button"
              onClick={() => pickQuestion(i)}
              aria-pressed={i === index}
              className={`relative isolate w-full cursor-pointer rounded-lg border px-3.5 py-2.5 text-left text-sm transition-colors duration-300 ${
                i === index
                  ? 'border-accent/50 bg-ink-3 text-paper'
                  : 'border-line text-muted hover:border-line-2 hover:text-paper'
              }`}
            >
              <span className="mr-2 label-mono text-accent">{String(i + 1).padStart(2, '0')}</span>
              {item.q}
            </button>
          ))}
        </div>

        <div className="min-h-[9.5rem] rounded-lg border border-line bg-ink/60 p-4">
          <p className="mb-2 label-mono tracking-[.14em] text-dim uppercase">
            <span className="text-accent">›</span> {QA[index].q}
          </p>
          <AnimatePresence mode="wait">
            {visiblePhase === 'thinking' ? (
              <motion.p
                key="thinking"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="label-mono text-dim"
              >
                Thinking…
              </motion.p>
            ) : (
              <motion.p
                key={`answer-${index}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25, ease: EASE }}
                className="text-[15px] leading-relaxed text-paper"
              >
                {visibleText}
                {visiblePhase === 'streaming' && (
                  <span className="ml-0.5 inline-block h-4 w-1.5 translate-y-0.5 animate-blink bg-accent" />
                )}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
