import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { useCallback, useRef, useState } from 'react';
import Contact from './components/Contact.jsx';
import Hero from './components/Hero.jsx';
import Marquee from './components/Marquee.jsx';
import Nav from './components/Nav.jsx';
import { About, Ask, Experience, Projects, Skills } from './components/Sections.jsx';
import Backdrop from './components/Backdrop.jsx';
import { EASE, ToastContext } from './hooks.js';

function Page({ toast }) {
  return (
    <div>
      <a href="#main" className="absolute -top-16 left-4 z-[400] rounded-md bg-surf px-4 py-2 font-semibold text-surf-ink no-underline focus:top-4">Skip to content</a>
      <Backdrop />
      <Nav />
      <Hero />
      <Marquee />
      <main id="main">
        <About />
        <Skills />
        <Ask />
        <Projects />
        <Experience />
      </main>
      <Contact />
      <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-[calc(24px+env(safe-area-inset-bottom,0px))] z-[260] flex justify-center px-4">
        <AnimatePresence>
          {toast && (
            <motion.div key={toast.id} initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 24, opacity: 0 }} transition={{ duration: 0.3, ease: EASE }}
              className="system-window border border-surf/45 bg-ink-2/95 px-5 py-3 text-center">
              <p className="label-mono text-[10px] uppercase tracking-[.22em] text-surf">[ Notification ]</p>
              <p className="mt-1 text-sm font-medium text-paper">{toast.text}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function App() {
  const [toast, setToast] = useState(null);
  const timer = useRef();
  const notify = useCallback((text) => {
    setToast({ text, id: Date.now() });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  return (
    <ToastContext.Provider value={notify}>
      <MotionConfig reducedMotion="user">
        <Page toast={toast} />
      </MotionConfig>
    </ToastContext.Provider>
  );
}
