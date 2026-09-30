// Screenshots in src/assets/shots are bundled automatically; look them up by file name (without extension).
// Drop e.g. `mountain-rose-herbs.png` in that folder and set `shot: 'mountain-rose-herbs'` in data.js.
const files = import.meta.glob('./assets/shots/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' });

export const shot = (name) => {
  if (!name) return null;
  const key = Object.keys(files).find((k) => k.replace(/^.*\//, '').replace(/\.\w+$/, '') === name);
  return key ? files[key] : null;
};

// Your portrait: save it as src/assets/photo.jpg (or .png/.webp) and it appears in the hero.
const photos = import.meta.glob('./assets/photo.{png,jpg,jpeg,webp}', { eager: true, import: 'default' });
export const photo = () => Object.values(photos)[0] ?? null;
