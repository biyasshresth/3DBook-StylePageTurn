import * as THREE from 'three';
import type { PageCopy } from '../data/pageCopy';

const PAPER = '#f4ede1';
const INK = 'rgba(42,36,30,0.82)';
const SERIF = '"Newsreader", "Iowan Old Style", Georgia, serif';
const SANS = '"Inter", system-ui, sans-serif';
let grainTile: HTMLCanvasElement | null = null;

function surface(w: number, h: number) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  return { canvas, ctx: canvas.getContext('2d') as CanvasRenderingContext2D };
}

function toTexture(canvas: HTMLCanvasElement, anisotropy: number, mirrored = false): THREE.CanvasTexture {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = anisotropy;
  if (mirrored) {
    texture.wrapS = THREE.RepeatWrapping;
    texture.repeat.x = -1;
    texture.offset.x = 1;
  }
  return texture;
}

function grain(): HTMLCanvasElement {
  if (grainTile) return grainTile;
  const { canvas, ctx } = surface(160, 160);
  const img = ctx.createImageData(160, 160);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.random() * 255;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 11;
  }
  ctx.putImageData(img, 0, 0);
  return (grainTile = canvas);
}

function spacing(ctx: CanvasRenderingContext2D, px: number): void {
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${px}px`;
}

function paintPaper(ctx: CanvasRenderingContext2D, w: number, h: number, spine: 'left' | 'right'): void {
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, w, h);
  const pattern = ctx.createPattern(grain(), 'repeat');
  if (pattern) { ctx.fillStyle = pattern; ctx.fillRect(0, 0, w, h); }
  const s = spine === 'left' ? 0 : w;
  const gutter = ctx.createLinearGradient(s, 0, spine === 'left' ? w * 0.14 : w * 0.86, 0);
  gutter.addColorStop(0, 'rgba(92,66,38,0.26)');
  gutter.addColorStop(0.25, 'rgba(92,66,38,0.08)');
  gutter.addColorStop(1, 'rgba(92,66,38,0)');
  ctx.fillStyle = gutter;
  ctx.fillRect(0, 0, w, h);
  const o = spine === 'left' ? w : 0;
  const edge = ctx.createLinearGradient(o, 0, spine === 'left' ? w * 0.97 : w * 0.03, 0);
  edge.addColorStop(0, 'rgba(92,66,38,0.1)');
  edge.addColorStop(1, 'rgba(92,66,38,0)');
  ctx.fillStyle = edge;
  ctx.fillRect(0, 0, w, h);
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(' ')) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) { lines.push(line); line = word; } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

function block(ctx: CanvasRenderingContext2D, text: string, w: number, h: number, top: number, bottom: number, max: number, style: string, fill: string | CanvasGradient): void {
  let size = max;
  let lines: string[] = [];
  for (;;) {
    ctx.font = `${style} ${size}px ${SERIF}`;
    lines = wrap(ctx, text, w * 0.76);
    if (lines.length * size * 1.04 <= (bottom - top) * h || size < w * 0.035) break;
    size *= 0.94;
  }
  const lh = size * 1.04;
  let y = top * h + ((bottom - top) * h - lines.length * lh) / 2 + lh / 2;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = fill;
  for (const l of lines) { ctx.fillText(l, w / 2, y); y += lh; }
}

function goldInk(ctx: CanvasRenderingContext2D, h: number): CanvasGradient {
  const g = ctx.createLinearGradient(0, h * 0.1, 0, h * 0.42);
  g.addColorStop(0, '#bf9a57');
  g.addColorStop(1, '#9c7438');
  return g;
}

function caps(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, size: number, color: string): void {
  ctx.font = `500 ${size}px ${SANS}`;
  spacing(ctx, size * 0.28);
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text.toUpperCase(), x, y);
  spacing(ctx, 0);
}

function rule(ctx: CanvasRenderingContext2D, w: number, y: number): void {
  ctx.fillStyle = 'rgba(168,129,63,0.55)';
  ctx.fillRect(w * 0.46, y, w * 0.08, Math.max(1, w * 0.0018));
}

export function createRightPageTexture(copy: PageCopy | null, folio: number, w: number, h: number, aniso: number) {
  const { canvas, ctx } = surface(w, h);
  paintPaper(ctx, w, h, 'left');
  if (copy) {
    caps(ctx, copy.kicker, w / 2, h * 0.09, w * 0.022, 'rgba(140,108,56,0.9)');
    block(ctx, copy.heading, w, h, 0.12, 0.4, w * 0.118, 'italic 400', goldInk(ctx, h));
    rule(ctx, w, h * 0.415);
  }
  caps(ctx, String(folio).padStart(2, '0'), w / 2, h * 0.945, w * 0.02, 'rgba(60,48,36,0.45)');
  return toTexture(canvas, aniso);
}

export function createLeftPageTexture(copy: PageCopy | null, folio: number, w: number, h: number, aniso: number, mirrored: boolean) {
  const { canvas, ctx } = surface(w, h);
  paintPaper(ctx, w, h, 'right');
  if (copy) {
    ctx.strokeStyle = 'rgba(168,129,63,0.35)';
    ctx.lineWidth = Math.max(1, w * 0.0016);
    ctx.strokeRect(w * 0.08, h * 0.07, w * 0.84, h * 0.86);
    ctx.strokeRect(w * 0.095, h * 0.083, w * 0.81, h * 0.834);
    block(ctx, copy.numeral, w, h, 0.2, 0.42, w * 0.24, 'italic 400', goldInk(ctx, h));
    caps(ctx, copy.leafTitle, w / 2, h * 0.47, w * 0.03, INK);
    rule(ctx, w, h * 0.515);
    block(ctx, copy.epigraph, w, h, 0.56, 0.72, w * 0.05, 'italic 400', 'rgba(60,48,36,0.72)');
    caps(ctx, String(folio).padStart(2, '0'), w / 2, h * 0.945, w * 0.02, 'rgba(60,48,36,0.45)');
  }
  return toTexture(canvas, aniso, mirrored);
}

export function createCoverTexture(w: number, h: number, aniso: number) {
  const { canvas, ctx } = surface(w, h);
  const base = ctx.createLinearGradient(0, 0, w, h);
  base.addColorStop(0, '#c89c5c');
  base.addColorStop(0.5, '#b0843f');
  base.addColorStop(1, '#9d7236');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 2200; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? `rgba(255,236,200,${Math.random() * 0.07})` : `rgba(60,38,12,${Math.random() * 0.06})`;
    ctx.fillRect(Math.random() * w - w * 0.2, Math.random() * h, w * (0.2 + Math.random() * 0.8), 1);
  }
  const sheen = ctx.createRadialGradient(w * 0.3, h * 0.25, 0, w * 0.3, h * 0.25, w * 1.1);
  sheen.addColorStop(0, 'rgba(255,238,205,0.22)');
  sheen.addColorStop(1, 'rgba(40,24,8,0.25)');
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = 'rgba(50,30,10,0.45)';
  ctx.fillRect(w * 0.042, 0, Math.max(2, w * 0.004), h);
  ctx.fillStyle = 'rgba(255,232,190,0.35)';
  ctx.fillRect(w * 0.047, 0, Math.max(1, w * 0.002), h);
  const size = w * 0.15;
  ctx.font = `italic 400 ${size}px ${SERIF}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ['Open', 'The Book', 'To Explore'].forEach((line, i) => {
    const x = w * 0.52;
    const y = h * 0.25 + i * size * 1.02;
    ctx.fillStyle = 'rgba(255,236,196,0.42)'; ctx.fillText(line, x + 2, y + 2);
    ctx.fillStyle = 'rgba(64,40,14,0.6)'; ctx.fillText(line, x - 1.5, y - 1.5);
    ctx.fillStyle = '#a5793a'; ctx.fillText(line, x, y);
  });
  return toTexture(canvas, aniso);
}

export function createEdgeTexture(aniso: number, horizontal: boolean) {
  const { canvas, ctx } = surface(256, 256);
  ctx.fillStyle = '#ece3d1';
  ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 256; i += 2) {
    ctx.fillStyle = `rgba(110,86,56,${0.04 + Math.random() * 0.1})`;
    if (horizontal) ctx.fillRect(0, i, 256, 1); else ctx.fillRect(i, 0, 1, 256);
  }
  return toTexture(canvas, aniso);
}

export function createShadowTexture() {
  const { canvas, ctx } = surface(256, 4);
  const g = ctx.createLinearGradient(0, 0, 256, 0);
  g.addColorStop(0, 'rgba(24,14,4,0.9)');
  g.addColorStop(0.35, 'rgba(24,14,4,0.35)');
  g.addColorStop(1, 'rgba(24,14,4,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 4);
  return new THREE.CanvasTexture(canvas);
}

export function createContactTexture() {
  const { canvas, ctx } = surface(256, 256);
  const g = ctx.createRadialGradient(128, 128, 20, 128, 128, 128);
  g.addColorStop(0, 'rgba(0,0,0,0.75)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(canvas);
}
