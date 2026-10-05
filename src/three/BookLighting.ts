import * as THREE from "three";

export class BookLighting {
  private readonly scene: THREE.Scene;
  private readonly lights: THREE.Object3D[];
  private readonly key: THREE.DirectionalLight;

  constructor(scene: THREE.Scene, mobile: boolean) {
    this.scene = scene;

    const ambient = new THREE.AmbientLight(0xfff4e6, 1.05);

    this.key = new THREE.DirectionalLight(0xfff1dc, 1.9);
    this.key.position.set(-1.6, 2.2, 4.2);
    this.key.castShadow = true;

    const size = mobile ? 1024 : 2048;

    this.key.shadow.mapSize.set(size, size);

    const cam = this.key.shadow.camera;

    cam.left = -1.7;
    cam.right = 1.7;
    cam.top = 1.3;
    cam.bottom = -1.3;
    cam.near = 1;
    cam.far = 10;

    this.key.shadow.bias = -0.0004;
    this.key.shadow.normalBias = 0.012;
    this.key.shadow.radius = 5;

    const fill = new THREE.PointLight(0xffcf9a, 0.55, 0, 0);
    fill.position.set(2.6, -1.2, 3);

    this.lights = [
      ambient,
      this.key,
      this.key.target,
      fill,
    ];

    this.scene.add(...this.lights);
  }

  dispose(): void {
    this.key.shadow.map?.dispose();
    this.scene.remove(...this.lights);
  }
}