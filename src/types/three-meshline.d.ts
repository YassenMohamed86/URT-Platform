declare module "three.meshline" {
  import * as THREE from "three";

  export class MeshLine {
    constructor();
    setPoints(points: number[] | Float32Array): void;
    geometry: THREE.BufferGeometry;
  }

  export class MeshLineMaterial extends THREE.ShaderMaterial {
    constructor(params?: {
      lineWidth?: number;
      color?: THREE.Color | string | number;
      transparent?: boolean;
      opacity?: number;
      depthWrite?: boolean;
      blending?: THREE.Blending;
      [key: string]: unknown;
    });
  }
}
