import type { Material, Object3D, Texture } from "three";

function disposeMaterial(material: Material) {
  for (const value of Object.values(material)) {
    if (value && typeof value === "object" && (value as Texture).isTexture) (value as Texture).dispose();
  }
  material.dispose();
}

/** Frees every geometry, material and material texture under `root`. */
export function disposeObject(root: Object3D) {
  root.traverse((object) => {
    const node = object as Object3D & { geometry?: { dispose(): void }; material?: Material | Material[] };
    node.geometry?.dispose();
    const material = node.material;
    if (Array.isArray(material)) material.forEach(disposeMaterial);
    else if (material) disposeMaterial(material);
  });
}
