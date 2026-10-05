import * as THREE from 'three';

export const MOBILE_BREAKPOINT = 768;
export const MOBILE_BOTTOM_UI = 132;
export const navWidth = (vw: number) => Math.min(200, Math.max(140, vw * 0.16));

export class BookCamera {
  readonly camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
  private base = 4;

  /** Fits the full two-page spread into the available viewport region (not a CSS scale). */
  fit(vw: number, vh: number, spreadW: number, spreadH: number): void {
    const mobile = vw < MOBILE_BREAKPOINT;
    const side = mobile ? 0 : navWidth(vw);
    const bottom = mobile ? MOBILE_BOTTOM_UI : 0;
    const availW = vw - side;
    const availH = vh - bottom;
    const fillW = mobile ? 0.94 : 0.82;
    const fillH = mobile ? 0.8 : 0.88;
    const t = 2 * Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2));
    const byWidth = (spreadW * vh) / (t * fillW * availW);
    const byHeight = (spreadH * vh) / (t * fillH * availH);
    this.base = Math.max(byWidth, byHeight);
    this.camera.aspect = vw / vh;
    this.camera.setViewOffset(vw, vh, -side / 2, bottom / 2, vw, vh);
    this.camera.updateProjectionMatrix();
  }

  update(openProgress: number, turn: number): void {
    const lift = Math.sin(Math.PI * openProgress);
    const distance = this.base * (1 + 0.07 * lift - 0.014 * turn);
    this.camera.position.set(0, -0.04 * lift, distance);
    this.camera.lookAt(0, 0, 0);
  }
}
