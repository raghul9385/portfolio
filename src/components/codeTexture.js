import { useMemo } from 'react';
import * as THREE from 'three';

export const CODE = [
  [['export ', 'kw'], ['function ', 'kw'], ['CheckInScreen', 'fn'], ['() {', 'txt']],
  [['  const ', 'kw'], ['{ kids, sync } ', 'txt'], ['= ', 'op'], ['useRoster', 'fn'], ['();', 'txt']],
  [],
  [['  useEffect', 'fn'], ['(() ', 'txt'], ['=> ', 'op'], ['{ sync(); }, []);', 'txt']],
  [],
  [['  return ', 'kw'], ['(', 'txt']],
  [['    <Screen ', 'tag'], ['offline', 'attr'], ['>', 'tag']],
  [['      <Header ', 'tag'], ['title', 'attr'], ['=', 'op'], ['"Check-in"', 'str'], [' />', 'tag']],
  [['      <List ', 'tag'], ['data', 'attr'], ['=', 'op'], ['{kids}', 'txt'], [' />', 'tag']],
  [['    </Screen>', 'tag']],
  [['  );', 'txt']],
  [['}', 'txt']],
];

export const TERMINAL = [
  [['$ ', 'op'], ['eas build --platform all', 'txt']],
  [['✔ ', 'ok'], ['ios      ', 'dim'], ['4m 12s', 'txt']],
  [['✔ ', 'ok'], ['android  ', 'dim'], ['3m 48s', 'txt']],
  [],
  [['$ ', 'op'], ['dotnet test', 'txt']],
  [['✔ ', 'ok'], ['128 passed', 'txt'], [' · 0 failed', 'dim']],
  [],
  [['$ ', 'op'], ['git push origin main', 'txt']],
  [['→ ', 'dim'], ['deployed in 41s', 'ok']],
];

/** Draws a code or terminal surface with the canvas API — no image files involved. */
export function useCodeTexture(lines, colors, { width = 768, height = 480, title = '' } = {}) {
  return useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    const tone = {
      kw: colors.accent, fn: colors.glow, tag: colors.accent, attr: colors.glow,
      str: '#f8c471', op: colors.glow, ok: colors.accent, dim: '#7c8a9c', txt: '#dbe7f2',
    };

    ctx.fillStyle = '#081525';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#0d2036';
    ctx.fillRect(0, 0, width, 42);
    [colors.grid, colors.grid, colors.accent].forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(26 + i * 22, 21, 6, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.fillStyle = '#7c8a9c';
    ctx.font = '17px ui-monospace, Consolas, monospace';
    ctx.fillText(title, 100, 16);

    ctx.font = '18px ui-monospace, Consolas, monospace';
    ctx.textBaseline = 'top';
    lines.forEach((line, row) => {
      let x = 28;
      const y = 68 + row * 32;
      ctx.fillStyle = '#3d5570';
      ctx.fillText(String(row + 1).padStart(2, ' '), 6, y);
      line.forEach(([text, kind]) => {
        ctx.fillStyle = tone[kind] ?? tone.txt;
        ctx.fillText(text, x, y);
        x += ctx.measureText(text).width;
      });
    });

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    return texture;
  }, [lines, colors, width, height, title]);
}
