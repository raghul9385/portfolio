import { ArrowUpRight } from 'lucide-react';
import { useState } from 'react';
import { websites } from '../data.js';
import { shot } from '../shots.js';
import { Reveal, Tilt } from './ui.jsx';

const domainOf = (url) => url.replace(/^https?:\/\//, '').replace(/\/$/, '');

function BrowserBar({ url }) {
  return (
    <div className="flex items-center gap-1.5 border-b border-line bg-ink px-3 py-2.5">
      {['bg-[#ff5f57]', 'bg-[#febc2e]', 'bg-[#28c840]'].map((c) => (
        <i key={c} className={`size-2 rounded-full ${c}`} />
      ))}
      <span className="ml-2 truncate rounded-md bg-ink-3 px-2.5 py-1 label-mono text-[10.5px] text-muted">
        {url}
      </span>
    </div>
  );
}

/**
 * Client sites as a stack of browser windows in 3D: the chosen one in front,
 * the next two standing behind it. Pick one from the list to bring it forward.
 */
export default function SiteShowcase() {
  const [index, setIndex] = useState(0);
  const active = websites[index];
  const behind = [1, 2].map((offset) => websites[(index + offset) % websites.length]);

  return (
    <div className="mt-24">
      <Reveal className="mb-10 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
        <div className="grid gap-3">
          <p className="label-mono text-accent uppercase">Wikpolt Softwares · 2023 — 2024</p>
          <h3 className="text-[clamp(1.75rem,3.8vw,2.75rem)] font-semibold">
            {websites.length} client sites,{' '}
            <span className="font-normal text-muted">live on the web.</span>
          </h3>
        </div>
        <p className="max-w-[34ch] text-sm text-muted">
          Websites I built and launched. Pick one to preview it, or open the live site.
        </p>
      </Reveal>

      <div className="grid gap-6 lg:grid-cols-[1.45fr_1fr] lg:gap-10">
        <Reveal data-tilt-scope className="[perspective:1600px]">
          <Tilt max={6} scope="[data-tilt-scope]" className="tilt-bare site-stack relative">
            {behind.map((site, i) => (
              <div
                key={`${site.href}-${i}`}
                aria-hidden="true"
                className={`site-ghost site-ghost-${i + 1} absolute inset-0 overflow-hidden card`}
              >
                <BrowserBar url={domainOf(site.href)} />
                <img
                  src={shot(site.shot)}
                  alt=""
                  loading="lazy"
                  className="aspect-[16/10] w-full object-cover object-top"
                />
              </div>
            ))}

            <div className="site-front relative overflow-hidden card">
              <BrowserBar url={domainOf(active.href)} />
              <div className="relative aspect-[16/10] overflow-hidden bg-ink-3">
                <img
                  key={active.shot}
                  src={shot(active.shot)}
                  alt={`${active.name} home page, first screen`}
                  loading="lazy"
                  className="fade-in absolute inset-0 size-full object-cover object-top"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent"
                />
                <a
                  href={active.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-3d absolute right-4 bottom-4 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-accent-ink no-underline transition-colors duration-200 hover:bg-accent-2"
                >
                  Visit live site <ArrowUpRight size={15} />
                </a>
              </div>
              <div className="grid gap-3 border-t border-line bg-ink-2 p-5 md:p-6">
                <p className="text-sm text-muted">{active.summary}</p>
                <ul
                  className="flex flex-wrap gap-1.5"
                  aria-label={`Technologies used on ${active.name}`}
                >
                  {active.tech.map((tech) => (
                    <li
                      key={tech}
                      className="rounded-md border border-line bg-ink-3 px-2.5 py-1.5 font-mono text-[11px] leading-none text-muted"
                    >
                      {tech}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Tilt>
        </Reveal>

        <Reveal as="ul" delay={0.05} className="grid content-start gap-1.5">
          {websites.map((site, i) => {
            const selected = i === index;
            return (
              <li key={site.href}>
                <button
                  type="button"
                  onClick={() => setIndex(i)}
                  onMouseEnter={() => setIndex(i)}
                  onFocus={() => setIndex(i)}
                  aria-pressed={selected}
                  aria-label={`Preview ${site.name}`}
                  className={`flex w-full cursor-pointer items-center gap-4 rounded-xl border px-4 py-4 text-left transition duration-300 ${
                    selected
                      ? 'translate-x-1 border-line-2 bg-ink-2/90 shadow-[0_20px_40px_-24px_rgb(0_0_0/0.8),inset_3px_0_0_var(--color-accent)]'
                      : 'border-transparent hover:border-line hover:bg-ink-2/50'
                  }`}
                >
                  <span
                    className={`label-mono tabular-nums ${selected ? 'text-accent' : 'text-dim'}`}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block truncate text-lg font-medium tracking-tight ${
                        selected ? 'text-paper' : 'text-muted'
                      }`}
                    >
                      {site.name}
                    </span>
                    <span className="block truncate label-mono text-dim">{site.kind}</span>
                  </span>
                  <ArrowUpRight
                    size={16}
                    aria-hidden="true"
                    className={`shrink-0 ${selected ? 'text-accent' : 'text-dim'}`}
                  />
                </button>
              </li>
            );
          })}
        </Reveal>
      </div>
    </div>
  );
}
