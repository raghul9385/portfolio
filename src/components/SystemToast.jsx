import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';
import { EASE, usePalette } from '../hooks.js';

const QUESTS = {
  about: ['New quest', 'Know the developer'],
  skills: ['Status window', 'Abilities unlocked'],
  ask: ['Assistant online', 'Ask about the work'],
  work: ['Quest log', 'Two apps cleared'],
  experience: ['History', 'Three years of raids'],
  contact: ['Gate open', 'Send a message'],
};

/** System notifications that announce each section, in the Monarch theme. */
export default function SystemToast() {
  const palette = usePalette();
  const reduce = useReducedMotion();
  const [note, setNote] = useState(null);

  useEffect(() => {
    if (palette !== 'monarch' || reduce) return;
    const seen = new Set();
    let timer;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting || seen.has(e.target.id) || !QUESTS[e.target.id]) return;
        seen.add(e.target.id);
        const [kind, text] = QUESTS[e.target.id];
        setNote({ id: e.target.id, kind, text });
        clearTimeout(timer);
        timer = setTimeout(() => setNote(null), 3200);
      });
    }, { rootMargin: '-35% 0px -45% 0px' });
    Object.keys(QUESTS).forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => { io.disconnect(); clearTimeout(timer); };
  }, [palette, reduce]);

  if (palette !== 'monarch') return null;

  return (
    <>
      <AnimatePresence>
        {note && (
          <motion.div key={`flash-${note.id}`} aria-hidden="true"
            className="pointer-events-none fixed inset-0 z-30 bg-[radial-gradient(60%_50%_at_50%_35%,color-mix(in_oklab,var(--color-surf)_35%,transparent),transparent_70%)]"
            initial={{ opacity: 0, scale: 1.08 }} animate={{ opacity: [0, 0.55, 0], scale: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: EASE }} />
        )}
      </AnimatePresence>
      <div aria-hidden="true" className="pointer-events-none fixed left-1/2 top-24 z-40 hidden -translate-x-1/2 md:block">
      <AnimatePresence>
        {note && (
          <motion.div
            key={note.id}
            initial={{ opacity: 0, y: -16, scale: 0.94, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -10, scale: 0.97, filter: 'blur(4px)' }}
            transition={{ duration: 0.45, ease: EASE }}
            className="system-window border border-surf/45 bg-ink-2/90 px-5 py-3 text-center backdrop-blur-md"
          >
            <p className="label-mono uppercase tracking-[.22em] text-surf">⟪ {note.kind} ⟫</p>
            <p className="mt-1 text-sm font-medium text-paper">{note.text}</p>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </>
  );
}
