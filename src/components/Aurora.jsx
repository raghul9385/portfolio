/**
 * Slow-moving aurora behind the whole site. Pure CSS (see `.aurora-*` in
 * index.css); it holds still for visitors who ask for reduced motion.
 */
export default function Aurora() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="aurora-band aurora-teal" />
      <div className="aurora-band aurora-cyan" />
      <div className="aurora-band aurora-violet" />
      <div className="aurora-grid" />
      {/* Darkens the lower part of the screen so long sections stay easy to read. */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,color-mix(in_oklab,var(--color-ink)_55%,transparent)_60%,var(--color-ink)_100%)]" />
    </div>
  );
}
