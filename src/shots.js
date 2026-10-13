// Screenshots in src/assets/shots are bundled automatically; look them up by file name (without extension).
// Drop e.g. `mountain-rose-herbs.png` in that folder and set `shot: 'mountain-rose-herbs'` in data.js.
const files = import.meta.glob('./assets/shots/*.{png,jpg,jpeg,webp}', {
  eager: true,
  import: 'default',
});

export const shot = (name) => {
  if (!name) return null;
  const key = Object.keys(files).find((k) => k.replace(/^.*\//, '').replace(/\.\w+$/, '') === name);
  return key ? files[key] : null;
};

// Your portrait: save it as src/assets/photo.jpg (or .png/.webp) and it appears in the hero.
const photos = import.meta.glob('./assets/photo.{png,jpg,jpeg,webp}', {
  eager: true,
  import: 'default',
});
export const photo = () => Object.values(photos)[0] ?? null;

// Gallery: run `npm run gallery` to turn the photos in gallery-originals/
// into the web-sized files read here. Every photo shows up; the order and
// captions come from `gallery` in data.js, and unlisted photos follow by name.
const galleryFiles = import.meta.glob('./assets/gallery/*.webp', {
  eager: true,
  import: 'default',
});
const galleryFullFiles = import.meta.glob('./assets/gallery/full/*.webp', {
  eager: true,
  import: 'default',
});
const galleryThumbFiles = import.meta.glob('./assets/gallery/thumb/*.webp', {
  eager: true,
  import: 'default',
});
const gallerySizes = import.meta.glob('./assets/gallery/sizes.json', {
  eager: true,
  import: 'default',
});

const baseName = (path) => path.replace(/^.*\//, '').replace(/\.\w+$/, '');
const byBaseName = (files) =>
  new Map(Object.entries(files).map(([path, src]) => [baseName(path), src]));

const GALLERY_SOURCES = {
  grid: galleryFiles,
  full: galleryFullFiles,
  thumb: galleryThumbFiles,
  sizes: Object.values(gallerySizes)[0] ?? {},
};

/**
 * Returns `[{ name, src, full, thumb, width, height, caption, href }]`.
 * `sources` is only passed by tests, to use their own files.
 */
export function galleryImages(details = [], sources = GALLERY_SOURCES) {
  const { sizes = {} } = sources;
  const grid = byBaseName(sources.grid);
  const full = byBaseName(sources.full ?? {});
  const thumbs = byBaseName(sources.thumb ?? {});
  const listed = details.map((item) => item.file).filter((name) => grid.has(name));
  const unlisted = [...grid.keys()].filter((name) => !listed.includes(name)).sort();
  const detailsByName = new Map(details.map((item) => [item.file, item]));

  return [...listed, ...unlisted].map((name) => {
    const extra = detailsByName.get(name) ?? {};
    return {
      name,
      src: grid.get(name),
      full: full.get(name) ?? grid.get(name),
      thumb: thumbs.get(name) ?? grid.get(name),
      width: sizes[name]?.width ?? null,
      height: sizes[name]?.height ?? null,
      caption: extra.caption ?? '',
      href: extra.href ?? null,
    };
  });
}
