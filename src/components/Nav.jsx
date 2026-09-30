import { useLenis } from 'lenis/react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { profile } from '../data.js';
import { openResume } from '../resume.js';
import { EASE, useToast } from '../hooks.js';
import { ArrowDownToLine } from 'lucide-react';
import Logo from './Logo.jsx';
import ThemeSwitch from './ThemeSwitch.jsx';
import { Button, Magnetic, SmartLink } from './ui.jsx';

const SECTIONS = ['about', 'skills', 'ask', 'work', 'experience', 'contact'];
const label = (id) => id[0].toUpperCase() + id.slice(1);

function RollText({ children }) {
  return (
    <span className="block h-[1.6em] overflow-hidden">
      <span className="block transition-transform duration-500 ease-expo group-hover:-translate-y-1/2 group-focus-visible:-translate-y-1/2">
        {children}
        <span aria-hidden="true" className="block text-surf">{children}</span>
      </span>
    </span>
  );
}

export default function Nav({ palette, onPalette }) {
  const lenis = useLenis();
  const toast = useToast();
  const getResume = () => {
    if (!openResume()) toast("Allow pop-ups to open your résumé");
    else toast("Résumé ready — save it as PDF from the print dialog");
  };
  const menuBtn = useRef(null);
  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 30, restDelta: 0.001 });
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('');

  useMotionValueEvent(scrollY, 'change', (y) => {
    setScrolled(y > 20);
    setHidden(y > (scrollY.getPrevious() ?? 0) && y > 240);
  });

  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => e.isIntersecting && setActive(e.target.id));
    }, { rootMargin: '-45% 0px -50% 0px' });
    SECTIONS.forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (open) lenis?.stop(); else lenis?.start();
    document.body.style.overflow = open ? 'hidden' : '';
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') { setOpen(false); menuBtn.current?.focus(); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, lenis]);

  const resume = { href: profile.resume, placeholder: 'Add your résumé PDF link' };

  return (
    <>
      <motion.div aria-hidden="true" className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-gradient-to-r from-glow via-surf to-surf-2" style={{ scaleX: progress }} />
      <motion.nav
        aria-label="Primary"
        animate={{ y: hidden && !open ? '-110%' : '0%' }}
        transition={{ duration: 0.5, ease: EASE }}
        className={`fixed inset-x-0 top-0 z-50 border-b pt-[env(safe-area-inset-top,0px)] transition-colors duration-300 ${scrolled ? 'border-line/0 bg-ink/70 backdrop-blur-xl after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-surf/50 after:to-transparent' : 'border-transparent'}`}
      >
        <div className="wrap flex h-17 items-center justify-between gap-6">
          <a href="#top" className="group flex items-center gap-3 font-mono text-sm no-underline" aria-label={`${profile.firstName} ${profile.lastName}, back to top`}>
            <Logo size={44} tagline={false} title="" className="shrink-0 text-surf transition duration-700 ease-expo group-hover:rotate-[-12deg] group-hover:scale-110" />
            <span className="hidden text-muted sm:inline">~/<b className="font-medium text-paper">{profile.handle}</b></span>
          </a>

          <div className="hidden items-center gap-2 lg:flex">
            {SECTIONS.map((id) => (
              <a key={id} href={`#${id}`} aria-current={active === id ? 'true' : undefined}
                className={`group relative rounded-full px-3 py-2 text-sm no-underline transition-colors ${active === id ? 'text-paper' : 'text-muted'}`}>
                <RollText>{label(id)}</RollText>
                {active === id && <motion.span layoutId="nav-dot" className="absolute bottom-0.5 left-1/2 -ml-0.5 size-1 rounded-full bg-surf" />}
              </a>
            ))}
            <ThemeSwitch palette={palette} onChange={onPalette} className="ml-2" />
            <Magnetic className="ml-3 inline-block">
              {resume.href
                ? <Button size="sm" href={resume.href} download>Résumé <ArrowDownToLine size={15} /></Button>
                : <Button size="sm" onClick={getResume}>Résumé <ArrowDownToLine size={15} className="transition-transform duration-500 ease-expo group-hover:translate-y-0.5" /></Button>}
            </Magnetic>
          </div>

          <ThemeSwitch palette={palette} onChange={onPalette} className="mr-2 lg:hidden" />
          <button ref={menuBtn} type="button" aria-expanded={open} aria-controls="mobileMenu" aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((o) => !o)}
            className="relative z-[70] size-11 cursor-pointer rounded-full border border-line-2 bg-transparent text-paper lg:hidden">
            <motion.i animate={open ? { top: 21, rotate: 45 } : { top: 17, rotate: 0 }} transition={{ duration: 0.4, ease: EASE }} className="absolute inset-x-3.25 h-[1.5px] bg-current" />
            <motion.i animate={open ? { top: 21, rotate: -45 } : { top: 25, rotate: 0 }} transition={{ duration: 0.4, ease: EASE }} className="absolute inset-x-3.25 h-[1.5px] bg-current" />
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobileMenu"
            initial={{ clipPath: 'circle(0% at 94% 4%)' }}
            animate={{ clipPath: 'circle(150% at 94% 4%)' }}
            exit={{ clipPath: 'circle(0% at 94% 4%)' }}
            transition={{ duration: 0.7, ease: EASE }}
            className="fixed inset-0 z-[45] flex flex-col gap-2 bg-ink px-[clamp(16px,4vw,48px)] pb-12 pt-[calc(96px+env(safe-area-inset-top,0px))]"
          >
            {SECTIONS.map((id, i) => (
              <motion.a key={id} href={`#${id}`} onClick={() => setOpen(false)}
                initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.06, duration: 0.6, ease: EASE }}
                className="flex items-baseline gap-3 font-display text-[clamp(2.5rem,12vw,4rem)] font-semibold leading-tight tracking-tight no-underline">
                <small className="label-mono text-surf">/{id}</small>{label(id)}
              </motion.a>
            ))}
            <div className="mt-auto grid gap-4">
              <ThemeSwitch palette={palette} onChange={onPalette} className="w-fit" />
              <p className="label-mono text-muted">{profile.email}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
