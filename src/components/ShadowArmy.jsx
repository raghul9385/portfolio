// [left %, height px, dim] — a ragged line-up, not a neat row
const RANKS = [
  [3, 78, true], [10, 104, false], [17, 86, true], [44, 70, true], [52, 92, false], [76, 88, true], [84, 110, false], [92, 80, true],
];

/** One shadow soldier: a hooded silhouette with lit eyes. */
function Soldier({ left, height, dim }) {
  return (
    <svg viewBox="0 0 60 140" width={height * 0.45} height={height} aria-hidden="true"
      className="absolute bottom-0" style={{ left: `${left}%`, opacity: dim ? 0.55 : 0.95 }}>
      <path d="M30 8 C40 8 45 16 44 26 C52 34 56 52 54 78 C58 96 58 120 56 140 L4 140 C2 120 2 96 6 78 C4 52 8 34 16 26 C15 16 20 8 30 8 Z" fill="#000" />
      <path d="M16 30 L4 18 L14 34 Z M44 30 L56 18 L46 34 Z" fill="#000" />
      <path d="M22 18 C22 12 38 12 38 18 C38 26 34 30 30 30 C26 30 22 26 22 18 Z" fill="#0d0a05" />
      <g className="shadow-eyes" fill="var(--color-surf-2)">
        <ellipse cx="26" cy="20" rx="2.1" ry="1.2" />
        <ellipse cx="34" cy="20" rx="2.1" ry="1.2" />
      </g>
    </svg>
  );
}

/** The shadow army standing at the foot of the hero — static, with a slow glow in the eyes. */
export default function ShadowArmy() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-32 overflow-hidden">
      <div className="absolute inset-x-0 bottom-0 h-28 bg-[radial-gradient(70%_100%_at_50%_100%,color-mix(in_oklab,var(--color-surf)_22%,transparent),transparent_70%)]" />
      <div className="absolute inset-0 [mask-image:linear-gradient(to_top,#000_40%,transparent)]">
        {RANKS.map(([left, height, dim]) => <Soldier key={left} left={left} height={height} dim={dim} />)}
      </div>
    </div>
  );
}
