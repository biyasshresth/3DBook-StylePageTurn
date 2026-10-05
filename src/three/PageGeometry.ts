import * as THREE from 'three';

const CURL_LAG = 0.95;
const CORNER_TWIST = 0.22;

export function createPageGeometry(width: number, height: number, sx: number, sy: number): THREE.PlaneGeometry {
  const geometry = new THREE.PlaneGeometry(width, height, sx, sy);
  geometry.translate(width / 2, 0, 0);
  return geometry;
}

export function deformPage(geometry: THREE.PlaneGeometry, angle: number, curl: number): void {
  const { width, height, widthSegments: sx, heightSegments: sy } = geometry.parameters;
  const position = geometry.attributes.position as THREE.BufferAttribute;
  const step = width / sx;

  for (let iy = 0; iy <= sy; iy++) {
    const v = iy / sy;
    const y = height / 2 - v * height;
    let x = 0;
    let z = 0;
    for (let ix = 0; ix <= sx; ix++) {
      if (ix > 0) {
        const u = (ix - 0.5) / sx;
        let a = angle - curl * CURL_LAG * Math.pow(u, 1.35) + curl * CORNER_TWIST * (v - 0.5) * u;
        a = a < 0 ? 0 : a > Math.PI ? Math.PI : a;
        x += Math.cos(a) * step;
        z += Math.sin(a) * step;
      }
      position.setXYZ(iy * (sx + 1) + ix, x, y, z);
    }
  }

  position.needsUpdate = true;
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
}
