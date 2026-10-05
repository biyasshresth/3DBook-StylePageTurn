import * as THREE from 'three';
import { createPageGeometry, deformPage } from './PageGeometry';

export class PageMesh {
  readonly group = new THREE.Group();
  private readonly geometry: THREE.PlaneGeometry;
  private shapeKey = '';

  constructor(width: number, height: number, segments: [number, number], front: THREE.Material, back: THREE.Material) {
    this.geometry = createPageGeometry(width, height, segments[0], segments[1]);
    for (const material of [front, back]) {
      const mesh = new THREE.Mesh(this.geometry, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.group.add(mesh);
    }
    this.update(0, 0, 0);
  }

  update(angle: number, curl: number, z: number): void {
    const key = `${angle.toFixed(4)}|${curl.toFixed(4)}`;
    if (key !== this.shapeKey) {
      deformPage(this.geometry, angle, curl);
      this.shapeKey = key;
    }
    this.group.position.z = z;
  }

  dispose(): void {
    this.geometry.dispose();
  }
}
