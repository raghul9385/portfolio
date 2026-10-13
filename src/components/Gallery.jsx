import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowUpRight, ChevronLeft, ChevronRight, Expand, Pause, Play, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { gallery, profile } from '../data.js';
import { EASE } from '../hooks.js';
import { galleryImages } from '../shots.js';
import { Reveal, SectionHead } from './ui.jsx';

const HOLD_MS = 5000; // how long each photo stays before the next one fades in
const SWIPE_DISTANCE = 60;

const instagramHandle = (url) => url.replace(/\/$/, '').split('/').pop();
const twoDigits = (n) => String(n).padStart(2, '0');

/** Remembers where a pointer went down and reports a left/right swipe when it comes up. */
function useSwipe(onSwipe) {
  const startX = useRef(null);
  const swiped = useRef(false);
  return {
    swiped,
    handlers: {
      onPointerDown: (event) => {
        startX.current = event.clientX;
        swiped.current = false;
      },
      onPointerUp: (event) => {
        if (startX.current === null) return;
        const distance = event.clientX - startX.current;
        startX.current = null;
        if (Math.abs(distance) < SWIPE_DISTANCE) return;
        swiped.current = true;
        onSwipe(distance < 0 ? 1 : -1);
      },
    },
  };
}

/** Pauses the slideshow while the section is scrolled out of view. */
function useOnScreen(ref) {
  const [onScreen, setOnScreen] = useState(false);
  useEffect(() => {
    if (!ref.current) return undefined;
    const observer = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting), {
      threshold: 0.25,
    });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);
  return onScreen;
}

function StepButtons({ onStep, className = '' }) {
  return [
    [-1, 'Previous photo', ChevronLeft, 'left-3 md:left-5'],
    [1, 'Next photo', ChevronRight, 'right-3 md:right-5'],
  ].map(([step, label, Icon, position]) => (
    <button
      key={label}
      type="button"
      aria-label={label}
      onClick={() => onStep(step)}
      className={`absolute ${position} top-1/2 z-10 size-11 -translate-y-1/2 cursor-pointer place-items-center rounded-full border border-white/15 bg-ink/70 text-paper transition-colors hover:border-accent hover:text-accent ${className}`}
    >
      <Icon size={20} />
    </button>
  ));
}

function InstagramLink({ href }) {
  return (
    <a
      href={href || profile.instagram}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent no-underline hover:underline"
    >
      View on Instagram <ArrowUpRight size={15} />
    </a>
  );
}

/* ───────────── full-screen viewer ───────────── */
function Lightbox({ images, index, direction, onStep, onClose }) {
  const reduce = useReducedMotion();
  const closeButton = useRef(null);
  const image = images[index];
  const slide = reduce ? 0 : 80;
  const swipe = useSwipe(onStep);

  useEffect(() => {
    const openedFrom = document.activeElement; // focus goes back here on close
    closeButton.current?.focus();
    document.body.style.overflow = 'hidden';

    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowRight') onStep(1);
      if (event.key === 'ArrowLeft') onStep(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      openedFrom?.focus?.();
    };
  }, [onClose, onStep]);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[300] grid grid-rows-[auto_1fr_auto] bg-ink/95 backdrop-blur-sm"
    >
      <div className="wrap flex items-center justify-between py-4">
        <p className="label-mono text-muted tabular-nums">
          {twoDigits(index + 1)} / {twoDigits(images.length)}
        </p>
        <button
          ref={closeButton}
          type="button"
          onClick={onClose}
          aria-label="Close viewer"
          className="grid size-11 cursor-pointer place-items-center rounded-full border border-line-2 bg-ink-2 text-paper transition-colors hover:border-accent hover:text-accent"
        >
          <X size={18} />
        </button>
      </div>

      <div
        className="relative flex min-h-0 touch-pan-y items-center justify-center overflow-hidden px-4 md:px-20"
        {...swipe.handlers}
      >
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.img
            key={image.name}
            src={image.full}
            alt={image.caption}
            custom={direction}
            variants={{
              enter: (dir) => ({ opacity: 0, x: dir * slide }),
              center: { opacity: 1, x: 0 },
              exit: (dir) => ({ opacity: 0, x: dir * -slide }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.45, ease: EASE }}
            draggable={false}
            className="max-h-full max-w-full rounded-xl object-contain shadow-[0_40px_120px_-30px_rgb(0_0_0/0.9)] select-none"
          />
        </AnimatePresence>
        {images.length > 1 && <StepButtons onStep={onStep} className="hidden sm:grid" />}
      </div>

      <div className="wrap flex flex-wrap items-center justify-between gap-3 py-5">
        <p className="text-paper">{image.caption}</p>
        <InstagramLink href={image.href} />
      </div>
    </motion.div>
  );
}

/* ───────────── slideshow ───────────── */
/**
 * One large photo that slowly zooms and cross-fades to the next, with a
 * thumbnail strip to jump around. Hidden until there are photos.
 */
export default function Gallery({ images = galleryImages(gallery) }) {
  const reduce = useReducedMotion();
  const section = useRef(null);
  const strip = useRef(null);
  const onScreen = useOnScreen(section);

  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [playing, setPlaying] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);

  const autoplay = playing && !reduce && images.length > 1;
  const paused = !autoplay || hovered || !onScreen || viewerOpen;

  const step = useCallback(
    (by) => {
      setDirection(by);
      setIndex((current) => (current + by + images.length) % images.length);
    },
    [images.length],
  );

  const goTo = (target) => {
    setDirection(target > index ? 1 : -1);
    setIndex(target);
  };

  const closeViewer = useCallback(() => setViewerOpen(false), []);
  const swipe = useSwipe(step);

  // Keep the active thumbnail in view without scrolling the page itself.
  useEffect(() => {
    const thumb = strip.current?.children[index];
    if (!thumb) return;
    strip.current.scrollTo?.({
      left: thumb.offsetLeft - strip.current.clientWidth / 2 + thumb.clientWidth / 2,
      behavior: reduce ? 'auto' : 'smooth',
    });
  }, [index, reduce]);

  // Fetch the next photo ahead of time so the cross-fade never waits on the network.
  useEffect(() => {
    if (images.length > 1) new Image().src = images[(index + 1) % images.length].full;
  }, [images, index]);

  if (images.length === 0) return null;

  const image = images[index];
  const handle = profile.instagram ? instagramHandle(profile.instagram) : null;
  const roundButton =
    'grid size-9 cursor-pointer place-items-center rounded-full border border-white/10 bg-ink/70 text-paper transition-colors hover:border-accent hover:text-accent';

  return (
    <section ref={section} id="gallery" aria-labelledby="gallery-title" className="pb-20 md:pb-32">
      <div className="wrap">
        <SectionHead
          index="06"
          label="Gallery"
          id="gallery-title"
          title="Off the keyboard,"
          muted="a few photos from Instagram."
        />

        <Reveal
          role="region"
          aria-roledescription="carousel"
          aria-label="Photo gallery"
          data-paused={paused}
          style={{ '--hold': `${HOLD_MS}ms` }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onKeyDown={(event) => {
            if (event.key === 'ArrowRight') step(1);
            if (event.key === 'ArrowLeft') step(-1);
          }}
          className="grid gap-4"
        >
          {/* ── coverflow: the photos either side lean away in 3D (wide screens only) ── */}
          <div className="relative [perspective:1400px] lg:px-[13%]">
            {images.length > 2 &&
              [
                [-1, 'coverflow-prev left-0'],
                [1, 'coverflow-next right-0'],
              ].map(([by, position]) => {
                const side = images[(index + by + images.length) % images.length];
                return (
                  <button
                    key={by}
                    type="button"
                    aria-hidden="true"
                    tabIndex={-1}
                    onClick={() => step(by)}
                    className={`coverflow-side absolute top-[8%] hidden h-[84%] w-[24%] cursor-pointer overflow-hidden rounded-2xl border border-line-2 bg-ink-2 p-0 lg:block ${position}`}
                  >
                    <img
                      key={side.name}
                      src={side.thumb}
                      alt=""
                      loading="lazy"
                      className="fade-in size-full object-cover"
                    />
                  </button>
                );
              })}

            {/* ── stage ── */}
            <div className="relative z-[1] aspect-[4/5] touch-pan-y overflow-hidden card shadow-[0_50px_100px_-40px_rgb(0_0_0/0.9)] sm:aspect-[16/9]">
              <AnimatePresence initial={false}>
                <motion.div
                  key={image.name}
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reduce ? 0 : 0.9, ease: 'easeInOut' }}
                >
                  {/* A blurred copy fills the frame behind portrait photos. */}
                  <img
                    src={image.src}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 size-full scale-110 object-cover opacity-45 blur-2xl"
                  />
                  <img
                    src={image.full}
                    alt={image.caption}
                    draggable={false}
                    className={`relative size-full object-contain select-none ${reduce ? '' : 'gallery-zoom'}`}
                  />
                </motion.div>
              </AnimatePresence>

              <button
                type="button"
                aria-label={`Open ${image.caption || 'photo'} full screen`}
                onClick={() => {
                  if (!swipe.swiped.current) setViewerOpen(true);
                }}
                {...swipe.handlers}
                className="absolute inset-0 z-[1] cursor-zoom-in bg-transparent"
              />

              <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between p-4">
                <span className="rounded-full border border-white/10 bg-ink/70 px-3 py-1 label-mono text-paper tabular-nums">
                  {twoDigits(index + 1)} / {twoDigits(images.length)}
                </span>
                <span className="pointer-events-auto flex gap-2">
                  {!reduce && images.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setPlaying((value) => !value)}
                      aria-label={playing ? 'Pause slideshow' : 'Play slideshow'}
                      className={roundButton}
                    >
                      {playing ? <Pause size={15} /> : <Play size={15} />}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setViewerOpen(true)}
                    aria-label="View full screen"
                    className={roundButton}
                  >
                    <Expand size={15} />
                  </button>
                </span>
              </div>

              {images.length > 1 && <StepButtons onStep={step} className="hidden sm:grid" />}

              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-wrap items-end justify-between gap-3 bg-gradient-to-t from-ink/90 via-ink/40 to-transparent p-5 pt-16 md:p-6 md:pt-20">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.p
                    key={image.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.4, ease: EASE }}
                    className="text-lg font-medium text-paper md:text-xl"
                  >
                    {image.caption}
                  </motion.p>
                </AnimatePresence>
                <span className="pointer-events-auto">
                  <InstagramLink href={image.href} />
                </span>
              </div>
            </div>
          </div>

          {/* ── timer: when the bar fills, the next photo comes in ── */}
          {autoplay && (
            <div aria-hidden="true" className="h-0.5 overflow-hidden rounded-full bg-line">
              <span
                key={image.name}
                className="gallery-timer block h-full bg-gradient-to-r from-accent to-glow"
                onAnimationEnd={() => step(1)}
              />
            </div>
          )}

          {/* ── thumbnails ── */}
          <div
            ref={strip}
            role="group"
            aria-label="Choose a photo"
            className="flex snap-x gap-2.5 overflow-x-auto pb-2"
          >
            {images.map((item, i) => {
              const active = i === index;
              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Show photo ${i + 1}: ${item.caption || 'untitled'}`}
                  aria-current={active ? 'true' : undefined}
                  className={`relative size-16 shrink-0 cursor-pointer snap-start overflow-hidden rounded-lg border-2 p-0 transition duration-300 sm:size-20 ${
                    active
                      ? 'border-accent opacity-100'
                      : 'border-transparent opacity-50 hover:opacity-90'
                  }`}
                >
                  <img
                    src={item.thumb}
                    alt=""
                    loading="lazy"
                    className={`size-full object-cover transition-transform duration-500 ${active ? 'scale-105' : ''}`}
                  />
                </button>
              );
            })}
          </div>
        </Reveal>

        {handle && (
          <Reveal className="mt-8 flex justify-center">
            <a
              href={profile.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-line-2 bg-ink/40 px-5 py-3 text-sm font-semibold text-paper no-underline transition-colors duration-200 hover:border-accent hover:text-accent"
            >
              More on Instagram · @{handle} <ArrowUpRight size={15} />
            </a>
          </Reveal>
        )}
      </div>

      <AnimatePresence>
        {viewerOpen && (
          <Lightbox
            images={images}
            index={index}
            direction={direction}
            onStep={step}
            onClose={closeViewer}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
