import { useTilt } from '../hooks.js';
import { shot } from '../shots.js';

// [text, tone] per token; tones map to theme colours below
const CODE = [
  [
    ['import ', 'kw'],
    ['{ useRoster } ', ''],
    ['from ', 'kw'],
    ["'@/hooks'", 'str'],
    [';', ''],
  ],
  [],
  [
    ['export ', 'kw'],
    ['function ', 'kw'],
    ['CheckInScreen', 'fn'],
    ['() {', ''],
  ],
  [
    ['  const ', 'kw'],
    ['{ kids, sync } = ', ''],
    ['useRoster', 'fn'],
    ['();', ''],
  ],
  [
    ['  return ', 'kw'],
    ['(', ''],
  ],
  [
    ['    <Screen ', 'tag'],
    ['offline ', 'attr'],
    ['onRefresh', 'attr'],
    ['={sync}>', ''],
  ],
  [
    ['      <KidList ', 'tag'],
    ['data', 'attr'],
    ['={kids} ', ''],
    ['/>', 'tag'],
  ],
  [['    </Screen>', 'tag']],
  [['  );', '']],
  [['}', '']],
];
const TONE = {
  kw: 'text-[#c4b5fd]',
  fn: 'text-accent-2',
  str: 'text-[#86efac]',
  tag: 'text-accent',
  attr: 'text-[#7dd3fc]',
};

// [label, position classes, depth px]
const CHIPS = [
  ['React', 'left-[-2%] top-[6%]', 140],
  ['TypeScript', 'right-[30%] top-[-4%]', 40],
  ['.NET', 'right-[-2%] top-[84%]', 170],
  ['SQL Server', 'left-[-4%] top-[70%]', 110],
];

function Window({ title, meta, className, children }) {
  return (
    <div
      className={`stage-panel absolute overflow-hidden rounded-xl border border-line-2 bg-ink-2/95 ${className}`}
    >
      <div className="flex items-center gap-1.5 border-b border-line bg-ink/80 px-3 py-2">
        {['bg-[#ff5f57]', 'bg-[#febc2e]', 'bg-[#28c840]'].map((c) => (
          <i key={c} className={`size-2 rounded-full ${c}`} />
        ))}
        <span className="ml-2 truncate rounded bg-ink-3 px-2 py-0.5 label-mono text-[10px] text-paper">
          {title}
        </span>
        {meta && (
          <span className="ml-auto hidden label-mono text-[10px] text-dim sm:inline">{meta}</span>
        )}
      </div>
      {children}
    </div>
  );
}

/** Back layer: the .NET API the app talks to. */
function ApiCard() {
  return (
    <Window
      title="GET /api/checkin"
      meta="ASP.NET"
      className="stage-api -top-[8%] right-[-4%] w-[52%]"
    >
      <pre className="p-3 font-mono text-[clamp(7.5px,0.9vw,10px)] leading-[1.65] text-muted">
        <span className="text-[#86efac]">200 OK</span> <span className="text-dim">· 38 ms</span>
        {'\n'}
        {'{ '}
        <span className="text-[#7dd3fc]">"room"</span>:{' '}
        <span className="text-[#86efac]">"K-2"</span>,{'\n  '}
        <span className="text-[#7dd3fc]">"kids"</span>: <span className="text-accent-2">24</span>,
        {'\n  '}
        <span className="text-[#7dd3fc]">"secure"</span>:{' '}
        <span className="text-[#c4b5fd]">true</span>
        {' }'}
      </pre>
    </Window>
  );
}

/** Middle layer: the React Native screen being written. */
function Editor() {
  return (
    <Window
      title="CheckInScreen.tsx"
      meta="React Native"
      className="stage-editor top-[22%] left-[0%] w-[70%]"
    >
      <pre className="overflow-hidden p-3 font-mono text-[clamp(8.5px,1.05vw,11.5px)] leading-[1.7] text-muted">
        {CODE.map((line, i) => (
          <div key={i} className={i === 5 ? '-mx-3 bg-accent/8 px-3' : ''}>
            <span className="mr-3 inline-block w-4 text-right text-dim/60">{i + 1}</span>
            {line.map(([t, tone], j) => (
              <span key={j} className={TONE[tone] ?? 'text-paper/85'}>
                {t}
              </span>
            ))}
            {i === CODE.length - 1 && (
              <span className="ml-0.5 inline-block h-[1.1em] w-[2px] translate-y-[2px] animate-blink bg-accent" />
            )}
          </div>
        ))}
      </pre>
      <div className="flex items-center gap-3 border-t border-line bg-ink/80 px-3 py-1.5 label-mono text-[9.5px] whitespace-nowrap text-dim">
        <span className="text-accent">● main</span>
        <span className="hidden sm:inline">TypeScript</span>
        <span className="ml-auto text-accent">✓ build passing</span>
      </div>
    </Window>
  );
}

/** Front layer: the app it ships as. */
function Phone() {
  const image = shot('kidcheck');
  return (
    <div className="stage-panel stage-phone absolute top-[30%] right-[4%] aspect-[9/19] w-[29%] rounded-[22px] border border-white/20 bg-ink p-[5px]">
      <div className="absolute top-2 left-1/2 z-10 h-1 w-8 -translate-x-1/2 rounded-full bg-black/80" />
      <div className="size-full overflow-hidden rounded-[17px] bg-ink-3">
        {image && <img src={image} alt="" className="size-full object-cover object-top" />}
      </div>
    </div>
  );
}

/**
 * The whole stack in CSS 3D: API at the back, code in the middle, the phone
 * in front, standing on a grid floor. Nothing loops; the scene turns a
 * little to follow the mouse anywhere over the hero.
 */
export default function HeroStage() {
  const tilt = useTilt({ max: 12, scope: 'header' });

  return (
    <div
      aria-hidden="true"
      className="stage relative mx-auto aspect-[1/0.9] w-[88%] max-w-[36rem] sm:w-full"
    >
      <div ref={tilt} className="stage-tilt absolute inset-0">
        <div className="stage-floor" />
        <div className="stage-shadow" />
        <ApiCard />
        <Editor />
        <Phone />

        {CHIPS.map(([label, position, depth]) => (
          <span
            key={label}
            className={`stage-chip absolute ${position} rounded-full border border-line-2 bg-ink-2/95 px-3 py-1.5 label-mono text-[11px] whitespace-nowrap text-paper`}
            style={{ '--z': `${depth}px` }}
          >
            <span className="mr-1.5 text-accent">●</span>
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
