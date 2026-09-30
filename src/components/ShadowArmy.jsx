import { useReducedMotion } from 'motion/react';
import { usePalette } from '../hooks.js';

// [left %, height px, scale, delay] — a ragged line-up, not a neat row.
const FRONT = [[8, 122, 1, 0], [26, 132, 1.05, 0.6], [46, 104, 0.95, 2.1], [66, 126, 1, 1], [86, 112, 0.96, 1.8]];
const BACK = [[16, 82, 0.8, 1.1], [38, 88, 0.82, 2.4], [58, 78, 0.76, 0.9], [78, 84, 0.8, 1.3]];
const EMBERS = [[14, 5, 17, 0], [38, 6, 19, 5], [62, 4, 15, 1.2], [86, 5, 18, 2]];

/** One shadow soldier: a hooded silhouette with lit eyes. */
function Soldier({ left, height, scale, delay, dim }) {
  return (
    <svg
      viewBox="0 0 60 140" width={height * 0.45} height={height}
      className="absolute bottom-0 origin-bottom animate-sway"
      style={{ left: `${left}%`, transform: `scaleX(-1) scale(${scale})`, animationDelay: `-${delay}s`, animationDuration: `${9 + (delay % 3)}s`, opacity: dim ? 0.55 : 0.9 }}
    >
      {/* cloak */}
      <path
        d="M30 8 C40 8 45 16 44 26 C52 34 56 52 54 78 C58 96 58 120 56 140 L4 140 C2 120 2 96 6 78 C4 52 8 34 16 26 C15 16 20 8 30 8 Z"
        fill="#05050d" opacity={dim ? 0.8 : 0.95}
      />
      {/* shoulder spikes */}
      <path d="M16 30 L4 18 L14 34 Z M44 30 L56 18 L46 34 Z" fill="#05050d" />
      {/* hood opening */}
      <path d="M22 18 C22 12 38 12 38 18 C38 26 34 30 30 30 C26 30 22 26 22 18 Z" fill="#0b0a18" />
      {/* eyes */}
      <g fill="var(--color-glow)" className="animate-glow-pulse">
        <ellipse cx="26" cy="20" rx="2.1" ry="1.3" />
        <ellipse cx="34" cy="20" rx="2.1" ry="1.3" />
      </g>
    </svg>
  );
}

/** The shadow ranks standing along the bottom of the page — Monarch theme only. */
export default function ShadowArmy() {
  const palette = usePalette();
  const reduce = useReducedMotion();
  if (palette !== 'monarch') return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 bottom-0 -z-[5] h-[32vh] overflow-hidden">
      <div className="absolute inset-x-0 bottom-0 h-full [mask-image:linear-gradient(to_top,#000_35%,transparent)]">
        <div className="absolute inset-x-0 bottom-[-8%] h-full opacity-70">
          {BACK.map(([left, height, scale, delay]) => (
            <Soldier key={`b-${left}`} left={left} height={height} scale={scale} delay={delay} dim />
          ))}
        </div>
        <div className="absolute inset-x-0 bottom-[-2%] h-full">
          {FRONT.map(([left, height, scale, delay]) => (
            <Soldier key={`f-${left}`} left={left} height={height} scale={scale} delay={delay} />
          ))}
        </div>
      </div>

      {/* monarch aura on the ground */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-[radial-gradient(120%_100%_at_50%_100%,rgb(157_78_221/0.35),transparent_70%)]" />

      {/* embers rising from the ranks */}
      {!reduce && EMBERS.map(([left, size, dur, delay]) => (
        <span key={left} className="absolute bottom-6 rounded-full bg-glow/70 animate-rise"
          style={{ left: `${left}%`, width: size, height: size, animationDuration: `${dur}s`, animationDelay: `-${delay}s` }} />
      ))}
    </div>
  );
}
