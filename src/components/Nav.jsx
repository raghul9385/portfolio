import { AnimatePresence, motion } from 'motion/react';
import { Download, Menu, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { gallery, profile } from '../data.js';
import { useOpenResume } from '../hooks.js';
import { galleryImages } from '../shots.js';
import Logo from './Logo.jsx';
import { Button } from './ui.jsx';

// The gallery link only appears once there are photos in src/assets/gallery.
const SECTIONS = [
  'about',
  'skills',
  'ask',
  'work',
  'experience',
  ...(galleryImages(gallery).length > 0 ? ['gallery'] : []),
  'contact',
];
const titleCase = (id) => id[0].toUpperCase() + id.slice(1);

/** Highlights the link for whichever section is in the middle of the screen. */
function useActiveSection(ids) {
  const [active, setActive] = useState('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    for (const id of ids) {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    }
    return () => observer.disconnect();
  }, [ids]);

  return active;
}

function useScrolledPast(offset) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > offset);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, [offset]);

  return scrolled;
}

export default function Nav() {
  const openResume = useOpenResume();
  const active = useActiveSection(SECTIONS);
  const scrolled = useScrolledPast(20);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef(null);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    if (!menuOpen) return undefined;

    const closeOnEscape = (event) => {
      if (event.key !== 'Escape') return;
      setMenuOpen(false);
      menuButton.current?.focus();
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [menuOpen]);

  return (
    <>
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 top-0 z-50 px-3 pt-[calc(10px+env(safe-area-inset-top,0px))]"
      >
        <div
          className={`mx-auto flex h-14 max-w-[1200px] items-center justify-between gap-6 rounded-full border pr-2 pl-3 transition-[background-color,border-color,box-shadow] duration-300 ${
            scrolled
              ? 'border-line-2 bg-ink-2/75 shadow-[0_18px_40px_-18px_rgb(0_0_0/0.8),inset_0_1px_0_rgb(255_255_255/0.06)] backdrop-blur-md'
              : 'border-transparent'
          }`}
        >
          <a
            href="#top"
            className="flex items-center gap-3 text-paper no-underline"
            aria-label={`${profile.firstName} ${profile.lastName}, back to top`}
          >
            <Logo size={34} title="" className="shrink-0 text-accent" />
            <span className="hidden font-mono text-sm text-muted sm:inline">
              {profile.firstName.toLowerCase()}
              <span className="text-dim">.dev</span>
            </span>
          </a>

          <div className="hidden items-center gap-1 lg:flex">
            {SECTIONS.map((id) => (
              <a
                key={id}
                href={`#${id}`}
                aria-current={active === id ? 'true' : undefined}
                className={`rounded-full px-3.5 py-2 text-sm no-underline transition-colors duration-200 hover:text-paper ${
                  active === id ? 'bg-ink-3/80 text-paper' : 'text-muted'
                }`}
              >
                {titleCase(id)}
              </a>
            ))}
            <div className="ml-3">
              {profile.resume ? (
                <Button size="sm" href={profile.resume} download>
                  Résumé <Download size={15} />
                </Button>
              ) : (
                <Button size="sm" onClick={openResume}>
                  Résumé <Download size={15} />
                </Button>
              )}
            </div>
          </div>

          <button
            ref={menuButton}
            type="button"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((open) => !open)}
            className="relative z-[70] grid size-11 cursor-pointer place-items-center rounded-full border border-line-2 bg-ink/60 text-paper lg:hidden"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[45] flex flex-col gap-1 bg-ink/97 px-[clamp(16px,4vw,48px)] pt-[calc(88px+env(safe-area-inset-top,0px))] pb-12"
          >
            {SECTIONS.map((id) => (
              <a
                key={id}
                href={`#${id}`}
                onClick={() => setMenuOpen(false)}
                className="border-b border-line py-4 text-2xl font-semibold tracking-tight text-paper no-underline"
              >
                {titleCase(id)}
              </a>
            ))}
            <button
              type="button"
              onClick={openResume}
              className="mt-6 inline-flex w-fit cursor-pointer items-center gap-2 rounded-full border border-accent bg-accent px-5 py-3 text-sm font-semibold text-accent-ink"
            >
              Résumé <Download size={15} />
            </button>
            <p className="mt-auto label-mono text-muted">{profile.email}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
