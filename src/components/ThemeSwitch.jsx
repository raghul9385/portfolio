import { motion } from 'motion/react';
import { PALETTES } from '../theme.js';

/** Three-palette picker. The active pill slides between the options. */
export default function ThemeSwitch({ palette, onChange, className = '' }) {
  return (
    <div className={`flex items-center gap-1 rounded-full border border-line bg-ink-2/70 p-1 backdrop-blur-sm ${className}`}
      role="radiogroup" aria-label="Colour theme">
      {PALETTES.map((p) => {
        const on = p.id === palette;
        return (
          <button
            key={p.id} type="button" role="radio" aria-checked={on} title={p.name} aria-label={p.name}
            onClick={() => onChange(p.id)}
            className="relative grid size-7 cursor-pointer place-items-center rounded-full"
          >
            {on && <motion.span layoutId="palette-pill" aria-hidden="true" className="absolute inset-0 rounded-full border border-line-2 bg-ink-3"
              transition={{ type: 'spring', stiffness: 380, damping: 30 }} />}
            <span className="relative size-3 rounded-full ring-1 ring-black/30" style={{ background: p.dot }} />
          </button>
        );
      })}
    </div>
  );
}
