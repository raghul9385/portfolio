import { Component, Suspense, lazy, useEffect, useState } from 'react';

const Scene3DBackground = lazy(() => import('./Scene3DBackground.jsx'));

const LINES = [
  [['export ', 'kw'], ['function ', 'kw'], ['CheckInScreen', 'fn'], ['() {', '']],
  [['  const ', 'kw'], ['{ kids, sync } ', ''], ['= ', 'op'], ['useRoster', 'fn'], ['();', '']],
  [['  return ', 'kw'], ['(', '']],
  [['    <Screen ', 'tag'], ['offline', 'attr'], ['>', 'tag']],
  [['      <List ', 'tag'], ['data', 'attr'], ['=', 'op'], ['{kids}', ''], [' />', 'tag']],
  [['    </Screen>', 'tag'], [');', '']],
];
const TONE = { kw: 'text-surf', fn: 'text-glow', tag: 'text-surf', attr: 'text-glow', op: 'text-glow' };

export function webglAvailable() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(window.WebGLRenderingContext && (canvas.getContext('webgl2') || canvas.getContext('webgl')));
  } catch {
    return false;
  }
}

/** Only run the 3D world where it will hold a steady frame rate. */
export function deviceCanHandle3D() {
  if (!webglAvailable()) return false;
  if (!window.matchMedia('(min-width: 900px)').matches) return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  const cores = navigator.hardwareConcurrency ?? 8;
  const memory = navigator.deviceMemory ?? 8;
  return cores >= 4 && memory >= 4;
}

/** Flat code panel for browsers that cannot run WebGL. */
export function FlatStage() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute right-[6%] top-[18%] w-[38%] max-w-[460px] -rotate-3 overflow-hidden rounded-xl border border-line bg-ink-2/80 opacity-80 shadow-2xl">
        <div className="flex items-center gap-1.5 border-b border-line px-3 py-2">
          {['bg-line-2', 'bg-line-2', 'bg-surf'].map((c, i) => <i key={i} className={`size-2 rounded-full ${c}`} />)}
          <span className="label-mono ml-2 text-dim">CheckInScreen.tsx</span>
        </div>
        <pre className="overflow-hidden p-3 font-mono text-[11px] leading-relaxed text-muted">
          {LINES.map((line, i) => (
            <div key={i}>
              <span className="mr-3 text-dim/70">{String(i + 1).padStart(2, ' ')}</span>
              {line.map(([text, kind], j) => <span key={j} className={TONE[kind] ?? ''}>{text}</span>)}
            </div>
          ))}
        </pre>
      </div>
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(70%_60%_at_15%_50%,var(--color-ink)_25%,transparent_75%)]" />
    </div>
  );
}

class SceneBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/**
  * Loads the page-wide 3D world only when the browser can draw it, and only
  * once the page has painted and gone idle — the text is never held up by it.
  */
export default function Scene3DFrame() {
  const [canRender, setCanRender] = useState(false);

  useEffect(() => {
    if (!deviceCanHandle3D()) return;
    let cancelled = false;
    const start = () => { if (!cancelled) setCanRender(true); };
    const schedule = () => {
      if ('requestIdleCallback' in window) {
        const id = window.requestIdleCallback(start, { timeout: 1500 });
        return () => window.cancelIdleCallback(id);
      }
      const id = setTimeout(start, 600);
      return () => clearTimeout(id);
    };

    let cleanup;
    if (document.readyState === 'complete') cleanup = schedule();
    else {
      const onLoad = () => { cleanup = schedule(); };
      window.addEventListener('load', onLoad, { once: true });
      cleanup = () => window.removeEventListener('load', onLoad);
    }
    return () => { cancelled = true; cleanup?.(); };
  }, []);

  if (!canRender) return null;
  return (
    <SceneBoundary>
      <Suspense fallback={null}>
        <Scene3DBackground />
      </Suspense>
    </SceneBoundary>
  );
}

/** Hero stand-in: only shows when there is no 3D world to look at. */
export function HeroStage({ className = '' }) {
  const [flat, setFlat] = useState(false);
  useEffect(() => { setFlat(!deviceCanHandle3D()); }, []);
  if (!flat) return null;
  return <div className={className}><FlatStage /></div>;
}
