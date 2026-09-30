/** Blueprint grid, soft light and a scan line — the room the work sits in. */
export default function Backdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* engineering grid */}
      <div className="absolute inset-0 opacity-[0.45] [mask-image:radial-gradient(120%_90%_at_50%_0%,#000_10%,transparent_75%)]
        bg-[linear-gradient(rgb(28_92_134/0.30)_1px,transparent_1px),linear-gradient(90deg,rgb(28_92_134/0.30)_1px,transparent_1px)]
        bg-[size:72px_72px]" />
      <div className="absolute inset-0 opacity-30 [mask-image:radial-gradient(100%_80%_at_50%_0%,#000,transparent_70%)]
        bg-[linear-gradient(rgb(55_220_201/0.16)_1px,transparent_1px),linear-gradient(90deg,rgb(55_220_201/0.16)_1px,transparent_1px)]
        bg-[size:288px_288px]" />

      {/* light pools */}
      <div className="absolute -left-[12%] top-[6%] size-[44rem] max-w-[120vw] rounded-full bg-[radial-gradient(closest-side,rgb(30_110_190/0.20),transparent)] animate-sway" />
      <div className="absolute -right-[8%] top-[42%] size-[36rem] max-w-[110vw] rounded-full bg-[radial-gradient(closest-side,rgb(55_220_201/0.10),transparent)] animate-sway [animation-delay:-4s]" />
      <div className="absolute bottom-[4%] left-[28%] size-[32rem] max-w-[110vw] rounded-full bg-[radial-gradient(closest-side,rgb(95_200_255/0.10),transparent)] animate-sway [animation-delay:-6s]" />
    </div>
  );
}
