import { useMemo } from 'react';
import * as THREE from 'three';

/** Stepped gradient map — what turns a smooth material into cel shading. */
export function useToonGradient(steps = 4) {
  return useMemo(() => {
    const data = new Uint8Array(steps);
    for (let i = 0; i < steps; i++) data[i] = Math.round(((i + 1) / steps) * 255);
    const tex = new THREE.DataTexture(data, steps, 1, THREE.RedFormat);
    tex.minFilter = THREE.NearestFilter;
    tex.magFilter = THREE.NearestFilter;
    tex.generateMipmaps = false;
    tex.needsUpdate = true;
    return tex;
  }, [steps]);
}

/** The radial burst behind an anime hero shot. */
export function useRaysTexture(accent, glow, size = 512) {
  return useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');
    const c = size / 2;

    ctx.clearRect(0, 0, size, size);
    const wedges = 28;
    for (let i = 0; i < wedges; i++) {
      const a0 = (i / wedges) * Math.PI * 2;
      const a1 = a0 + (Math.PI * 2) / wedges * 0.42;
      const grad = ctx.createRadialGradient(c, c, size * 0.06, c, c, c);
      grad.addColorStop(0, i % 2 ? `${glow}cc` : `${accent}cc`);
      grad.addColorStop(0.55, i % 2 ? `${glow}33` : `${accent}33`);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(c, c);
      ctx.arc(c, c, c, a0, a1);
      ctx.closePath();
      ctx.fill();
    }
    // soft core
    const core = ctx.createRadialGradient(c, c, 0, c, c, size * 0.3);
    core.addColorStop(0, `${accent}aa`);
    core.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = core;
    ctx.fillRect(0, 0, size, size);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [accent, glow, size]);
}

/** A single petal sprite, drawn once and reused by the particle field. */
export function usePetalTexture(accent, size = 96) {
  return useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');
    const c = size / 2;
    ctx.translate(c, c);
    ctx.rotate(-0.4);
    const grad = ctx.createLinearGradient(-c, -c, c, c);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(1, accent);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(0, -c * 0.8);
    ctx.bezierCurveTo(c * 0.75, -c * 0.4, c * 0.55, c * 0.6, 0, c * 0.8);
    ctx.bezierCurveTo(-c * 0.55, c * 0.6, -c * 0.75, -c * 0.4, 0, -c * 0.8);
    ctx.fill();
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [accent, size]);
}

/** Concentric rune ring — the gate that opens behind the headline. */
export function useRuneTexture(accent, glow, size = 512) {
  return useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');
    const c = size / 2;
    ctx.clearRect(0, 0, size, size);

    const ring = (radius, width, color, alpha) => {
      ctx.beginPath();
      ctx.arc(c, c, radius, 0, Math.PI * 2);
      ctx.lineWidth = width;
      ctx.strokeStyle = color;
      ctx.globalAlpha = alpha;
      ctx.stroke();
      ctx.globalAlpha = 1;
    };

    ring(c * 0.94, 4, accent, 0.9);
    ring(c * 0.88, 1.5, accent, 0.5);
    ring(c * 0.62, 2.5, glow, 0.7);
    ring(c * 0.34, 1.5, accent, 0.45);

    // tick marks
    ctx.strokeStyle = accent;
    for (let i = 0; i < 72; i++) {
      const a = (i / 72) * Math.PI * 2;
      const long = i % 6 === 0;
      const r0 = c * (long ? 0.78 : 0.83);
      const r1 = c * 0.88;
      ctx.globalAlpha = long ? 0.85 : 0.4;
      ctx.lineWidth = long ? 4 : 2;
      ctx.beginPath();
      ctx.moveTo(c + Math.cos(a) * r0, c + Math.sin(a) * r0);
      ctx.lineTo(c + Math.cos(a) * r1, c + Math.sin(a) * r1);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // glyph blocks around the mid ring
    ctx.fillStyle = glow;
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2 + 0.06;
      const r = c * 0.62;
      const x = c + Math.cos(a) * r;
      const y = c + Math.sin(a) * r;
      ctx.globalAlpha = i % 2 ? 0.75 : 0.35;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(a);
      ctx.fillRect(-7, -3, 14, 6);
      ctx.restore();
    }
    ctx.globalAlpha = 1;

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [accent, glow, size]);
}

/** A vertical tear in the air — the gate's rift. */
export function useRiftTexture(accent, glow, width = 320, height = 640) {
  return useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    const cx = width / 2;

    const halo = ctx.createRadialGradient(cx, height / 2, 0, cx, height / 2, width * 0.6);
    halo.addColorStop(0, `${glow}66`);
    halo.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, width, height);

    // jagged core
    ctx.beginPath();
    ctx.moveTo(cx, 20);
    let x = cx;
    for (let y = 20; y < height - 20; y += 34) {
      x = cx + (Math.random() - 0.5) * 26;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(cx, height - 20);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 7;
    ctx.shadowColor = accent;
    ctx.shadowBlur = 40;
    ctx.stroke();
    ctx.strokeStyle = accent;
    ctx.lineWidth = 18;
    ctx.globalAlpha = 0.5;
    ctx.stroke();
    ctx.globalAlpha = 1;

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [accent, glow, width, height]);
}
