/** Static blueprint grid and soft light behind the page. */
export default function Backdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 opacity-[0.35] [mask-image:radial-gradient(120%_90%_at_50%_0%,#000_10%,transparent_75%)]
        bg-[linear-gradient(color-mix(in_oklab,var(--color-line-2)_45%,transparent)_1px,transparent_1px),linear-gradient(90deg,color-mix(in_oklab,var(--color-line-2)_45%,transparent)_1px,transparent_1px)]
        bg-[size:72px_72px]" />
    </div>
  );
}
