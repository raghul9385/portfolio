/**
 * Turns the photos in gallery-originals/ into web-sized WebP files:
 *
 *   src/assets/gallery/<name>.webp       1000px on the long side, for the grid
 *   src/assets/gallery/full/<name>.webp  2000px on the long side, for the viewer
 *   src/assets/gallery/thumb/<name>.webp 320px square, for the thumbnail strip
 *   src/assets/gallery/sizes.json        each photo's width and height, so the
 *                                        page can reserve space before it loads
 *
 * Usage: npm run gallery
 *
 * Photos in sub-folders (e.g. gallery-originals/not-shown/) are skipped, so you
 * can park a photo there to take it off the site without deleting it.
 *
 * Phone photos (5–20 MB) come out at roughly 100–300 KB. Nikon .nef RAW files
 * work too: the full-size JPEG preview the camera embeds in them is used.
 */
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const SOURCE = 'gallery-originals';
const GRID = 'src/assets/gallery';
const FULL = 'src/assets/gallery/full';
const THUMB = 'src/assets/gallery/thumb';
const SUPPORTED = /\.(jpe?g|png|webp|avif|tiff?|nef)$/i;

const JPEG_START = Buffer.from([0xff, 0xd8, 0xff]);
const JPEG_END = Buffer.from([0xff, 0xd9]);

/** RAW files carry a full-size JPEG preview; this returns the largest one. */
function largestEmbeddedJpeg(buffer) {
  let best = null;
  let start = buffer.indexOf(JPEG_START);

  while (start !== -1) {
    const next = buffer.indexOf(JPEG_START, start + 3);
    const limit = next === -1 ? buffer.length : next;
    let end = -1;
    for (let i = buffer.indexOf(JPEG_END, start + 3); i !== -1 && i < limit;) {
      end = i + 2;
      i = buffer.indexOf(JPEG_END, i + 2);
    }
    if (end > 0 && (!best || end - start > best.length)) best = buffer.subarray(start, end);
    start = next;
  }

  if (!best) throw new Error('no JPEG preview found inside the RAW file');
  return best;
}

async function readImage(file) {
  const buffer = await readFile(file);
  return /\.nef$/i.test(file) ? largestEmbeddedJpeg(buffer) : buffer;
}

async function writeWebp(input, longSide, quality, destination) {
  const info = await sharp(input)
    .rotate() // apply the phone's EXIF orientation
    .resize(longSide, longSide, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality })
    .toFile(destination);
  return info;
}

const kb = (bytes) => `${Math.round(bytes / 1024)} KB`;

await mkdir(FULL, { recursive: true });
await mkdir(THUMB, { recursive: true });
const files = (await readdir(SOURCE)).filter((name) => SUPPORTED.test(name)).sort();

if (files.length === 0) {
  console.info(`No photos in ${SOURCE}/ — add some and run this again.`);
}

const sizes = {};

for (const file of files) {
  const name = path.parse(file).name;
  const input = await readImage(path.join(SOURCE, file));

  const grid = await writeWebp(input, 1000, 78, path.join(GRID, `${name}.webp`));
  const full = await writeWebp(input, 2000, 82, path.join(FULL, `${name}.webp`));
  await sharp(input)
    .rotate()
    // Square crop centred on the most interesting part of the photo (usually a face).
    .resize(320, 320, { fit: 'cover', position: sharp.strategy.attention })
    .webp({ quality: 72 })
    .toFile(path.join(THUMB, `${name}.webp`));
  sizes[name] = { width: grid.width, height: grid.height };

  console.info(
    `${name}: ${grid.width}×${grid.height} (${kb(grid.size)}), full ${full.width}×${full.height} (${kb(full.size)})`,
  );
}

await writeFile(path.join(GRID, 'sizes.json'), `${JSON.stringify(sizes, null, 2)}\n`);
