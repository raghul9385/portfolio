import { marquee } from '../data.js';

/** One slow CSS-driven row of technologies; pauses on hover. */
export default function Marquee() {
  const list = (hidden) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center gap-10 pr-10">
      {marquee.map((t) => (
        <li key={t} className="flex items-center gap-10 whitespace-nowrap font-display text-[clamp(1.25rem,2.6vw,2rem)] font-medium tracking-tight text-dim after:text-[.45em] after:text-surf after:content-['✦']">
          {t}
        </li>
      ))}
    </ul>
  );
  return (
    <div aria-label="Technologies I work with" className="group overflow-hidden border-b border-line bg-ink/60 py-6 [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
      <div className="flex w-max animate-drift [animation-duration:45s] group-hover:[animation-play-state:paused]">
        {list(false)}{list(true)}
      </div>
    </div>
  );
}
