import * as THREE from 'three';
import { BookRenderer } from './BookRenderer';
import { BookCamera, MOBILE_BREAKPOINT } from './BookCamera';
import { BookLighting } from './BookLighting';
import { buildBook, DIMS, type BookParts } from './BookStructure';
import type { ScreenRect, TurnState } from './types';
import type { BookPage } from '../data/pages';

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export class BookScene {
  onRect: ((rect: ScreenRect) => void) | null = null;
  private readonly scene = new THREE.Scene();
  private readonly renderer: BookRenderer;
  private readonly cam = new BookCamera();
  private readonly lighting: BookLighting;
  private readonly parts: BookParts;
  private readonly v = new THREE.Vector3();
  private openProgress = 0;
  private turnCam = 0;
  private vw = 1;
  private vh = 1;
  private rectKey = '';

  constructor(canvas: HTMLCanvasElement, pages: BookPage[]) {
    const mobile = window.innerWidth < MOBILE_BREAKPOINT;
    this.renderer = new BookRenderer(canvas, mobile);
    this.parts = buildBook({
      pages,
      segments: mobile ? [26, 12] : [44, 20],
      textureWidth: mobile ? 768 : 1024,
      anisotropy: this.renderer.maxAnisotropy,
    });
    this.lighting = new BookLighting(this.scene, mobile);
    this.scene.add(this.parts.root);
    this.setOpen(0);
    this.resize(canvas.clientWidth || window.innerWidth, canvas.clientHeight || window.innerHeight);
    this.renderer.start(this.frame);
    document.addEventListener('visibilitychange', this.onVisibility);
  }

  resize(w: number, h: number): void {
    if (!w || !h) return;
    this.vw = w;
    this.vh = h;
    this.renderer.setSize(w, h);
    this.cam.fit(w, h, 2 * (DIMS.W + DIMS.OVER), DIMS.H + DIMS.OVER * 2);
    this.rectKey = '';
  }

  setOpen(p: number): void {
    const { W, H, T, OVER } = DIMS;
    const { coverPivot, contact, coverRightZ } = this.parts;
    this.openProgress = p;
    coverPivot.rotation.y = -Math.PI * p;
    coverPivot.position.z = lerp(coverRightZ, T, p) + Math.sin(Math.PI * p) * 0.05;
    const e = p * p * (3 - 2 * p);
    contact.position.x = lerp((W + OVER) / 2, 0, e);
    contact.scale.set(lerp(W + OVER, 2 * (W + OVER), e) * 1.22, (H + OVER * 2) * 1.2, 1);
  }

  setPosition(pos: number, sample: (fraction: number) => TurnState): void {
    const { sheets, shadowRight, shadowLeft } = this.parts;
    const { T, BLOCK, GAP } = DIMS;
    const S = sheets.length;
    const p = Math.min(Math.max(pos, 0), S);
    const idx = Math.min(Math.floor(p), S - 1);
    const frac = p - idx;
    const st = sample(frac);
    const zRight = (k: number) => BLOCK + (S - 1 - k) * GAP + 0.001;
    const zLeft = (k: number) => T + 0.001 + k * GAP;
    this.turnCam = st.cam;

    for (let k = 0; k < S; k++) {
      const angle = k < idx ? Math.PI : k > idx ? 0 : st.angle;
      const t = angle / Math.PI;
      const lift = k === idx ? Math.sin(Math.PI * frac) * 0.012 : 0;
      sheets[k].update(angle, k === idx ? st.curl : 0, lerp(zRight(k), zLeft(k), t) + lift);
    }

    const t = st.angle / Math.PI;
    shadowRight.material.opacity = st.shadow * 0.5 * (1 - t);
    shadowRight.position.z = (idx + 1 < S ? zRight(idx + 1) : BLOCK) + GAP * 0.45;
    shadowRight.scale.x = 0.45 + 0.55 * Math.cos(st.angle * 0.5);
    shadowRight.position.x = (DIMS.PW / 2) * shadowRight.scale.x;
    shadowLeft.material.opacity = st.shadow * 0.5 * t;
    shadowLeft.position.z = (idx > 0 ? zLeft(idx - 1) : T) + GAP * 0.45;
  }

  dispose(): void {
    document.removeEventListener('visibilitychange', this.onVisibility);
    this.renderer.dispose();
    this.lighting.dispose();
    this.parts.dispose();
    this.onRect = null;
  }

  private readonly frame = (): void => {
    this.cam.update(this.openProgress, this.turnCam);
    this.renderer.render(this.scene, this.cam.camera);
    this.emitRect();
  };

  private emitRect(): void {
    if (!this.onRect) return;
    const { PW, PH, BLOCK } = DIMS;
    const [x1, y1] = this.project(-PW, PH / 2, BLOCK);
    const [x2, y2] = this.project(PW, -PH / 2, BLOCK);
    const rect = { x: x1, y: y1, width: x2 - x1, height: y2 - y1 };
    const key = `${rect.x.toFixed(1)}|${rect.y.toFixed(1)}|${rect.width.toFixed(1)}|${rect.height.toFixed(1)}`;
    if (key === this.rectKey) return;
    this.rectKey = key;
    this.onRect(rect);
  }

  private project(x: number, y: number, z: number): [number, number] {
    this.v.set(x, y, z).project(this.cam.camera);
    return [((this.v.x + 1) / 2) * this.vw, ((1 - this.v.y) / 2) * this.vh];
  }

  private readonly onVisibility = (): void => {
    if (document.hidden) this.renderer.stop();
    else this.renderer.start();
  };
}
