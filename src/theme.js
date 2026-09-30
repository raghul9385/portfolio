// Palettes. The CSS variables live in index.css under :root[data-palette="…"];
// the 3D scene reads the matching colours from here.
export const PALETTES = [
  { id: 'monarch', name: 'Monarch (system)', dot: '#5eb3ff' },
  { id: 'ocean', name: 'Deep Ocean', dot: '#37dcc9' },
  { id: 'violet', name: 'Midnight Violet', dot: '#a78bfa' },
  { id: 'carbon', name: 'Carbon Amber', dot: '#ffb23f' },
];

export const SCENE = {
  monarch: { accent: '#5eb3ff', glow: '#9d4edd', key: '#e8f3ff', body: '#08071a', panel: '#0a0920', grid: '#3a2a7a' },
  ocean: { accent: '#37dcc9', glow: '#5fc8ff', key: '#dff2ff', body: '#0b2233', panel: '#07223a', grid: '#14486b' },
  violet: { accent: '#a78bfa', glow: '#f472b6', key: '#efe9ff', body: '#171536', panel: '#141234', grid: '#342d78' },
  carbon: { accent: '#ffb23f', glow: '#ff7a59', key: '#fff4e2', body: '#15171c', panel: '#121418', grid: '#333b47' },
};

export const DEFAULT_PALETTE = 'monarch';
const KEY = 'rb-palette';

export function readPalette() {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved && PALETTES.some((p) => p.id === saved)) return saved;
  } catch { /* private mode or blocked storage */ }
  return DEFAULT_PALETTE;
}

export function savePalette(id) {
  try { localStorage.setItem(KEY, id); } catch { /* nothing to do */ }
}
