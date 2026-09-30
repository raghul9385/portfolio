import { ReactLenis } from 'lenis/react';
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import Contact from './components/Contact.jsx';
import Cursor from './components/Cursor.jsx';
import Hero from './components/Hero.jsx';
import Marquee from './components/Marquee.jsx';
import Nav from './components/Nav.jsx';
import ProgressDial from './components/ProgressDial.jsx';
import ShadowArmy from './components/ShadowArmy.jsx';
import SystemToast from './components/SystemToast.jsx';
import Spotlight from './components/Spotlight.jsx';
import { About, Ask, Experience, Projects, Skills } from './components/Sections.jsx';
import Backdrop from './components/Backdrop.jsx';
import Scene3DFrame from './components/Scene3DFrame.jsx';
import { EASE, PaletteContext, ToastContext } from './hooks.js';
import { readPalette, savePalette } from './theme.js';

function Page({ toast, palette, setPalette }) {
  return (
    <div className="grain">
      <a href="#main" className="absolute -top-16 left-4 z-[400] rounded-md bg-surf px-4 py-2 font-semibold text-surf-ink no-underline focus:top-4">Skip to content</a>
      <Backdrop />
      <Scene3DFrame />
      <ShadowArmy />
      <SystemToast />
      <Spotlight />
      <Cursor />
      <Nav palette={palette} onPalette={setPalette} />
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
      <ProgressDial />
      <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-[calc(24px+env(safe-area-inset-bottom,0px))] z-[260] flex justify-center px-4">
        <AnimatePresence>
          {toast && (
            <motion.div key={toast.id} initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }} transition={{ duration: 0.5, ease: EASE }}
              className="rounded-full bg-paper px-5 py-3 text-sm font-semibold text-ink shadow-2xl">
              {toast.text}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function App() {
  const reduce = useReducedMotion();
  const [toast, setToast] = useState(null);
  const [palette, setPalette] = useState(readPalette);
  const [smoothReady, setSmoothReady] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setSmoothReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.palette = palette;
    savePalette(palette);
  }, [palette]);
  const timer = useRef();
  const notify = useCallback((text) => {
    setToast({ text, id: Date.now() });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  const page = (
    <ToastContext.Provider value={notify}>
      <MotionConfig reducedMotion="user">
        <PaletteContext.Provider value={palette}>
          <Page toast={toast} palette={palette} setPalette={setPalette} />
        </PaletteContext.Provider>
      </MotionConfig>
    </ToastContext.Provider>
  );

  // Lenis gives inertial smooth scrolling (and smooth anchor jumps). It starts
  // after the first paint so it can never hold up the initial render.
  return reduce || !smoothReady
    ? page
    : <ReactLenis root options={{ lerp: 0.17, wheelMultiplier: 1.1, anchors: { offset: -72 } }}>{page}</ReactLenis>;
}
