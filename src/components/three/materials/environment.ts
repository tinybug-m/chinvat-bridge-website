import {
  BackSide,
  BoxGeometry,
  Color,
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  PMREMGenerator,
  PlaneGeometry,
  Scene,
  type Texture,
  type WebGLRenderer,
} from "three";
import { disposeObject } from "../core/dispose";
import { PALETTE_3D } from "./palette";

/*
 * A small photo studio, baked once per renderer into a PMREM. No HDR
 * download: the room is a few emissive cards. The camera looks down -z, so
 * the cards behind the viewer (+z) are what flat front faces reflect; the
 * coloured cards light the bevels and walls.
 *
 *   cobalt softbox  upper left, the key colour of the glass body
 *   saffron strip   right rim, the amber highlight in the logo
 *   white overhead  soft top light, the clean specular
 *   saffron floor   warm bounce on downward-facing bevels
 *   cyan kicker     a trace of the logo's cyan sheen
 */

interface Card {
  color: number;
  intensity: number;
  size: [number, number];
  position: [number, number, number];
}

const CARDS: Card[] = [
  // Behind the viewer: what the front faces see, a soft paper-white wall with a brighter band.
  { color: PALETTE_3D.paper, intensity: 0.9, size: [34, 20], position: [0, 0, 17] },
  { color: 0xffffff, intensity: 1.6, size: [26, 4.5], position: [0, 5.5, 16] },
  { color: PALETTE_3D.cobalt, intensity: 2.6, size: [10, 6], position: [-6, -6.5, 15.5] },
  // Key cobalt softbox.
  { color: PALETTE_3D.cobalt, intensity: 3.2, size: [9, 13], position: [-13, 5, 7] },
  // Saffron rim strip.
  { color: PALETTE_3D.saffronLight, intensity: 5.5, size: [1.8, 16], position: [13, 0, 5] },
  // White overhead.
  { color: 0xffffff, intensity: 4, size: [18, 4], position: [0, 14, 4] },
  // Warm floor bounce.
  { color: PALETTE_3D.saffron, intensity: 1.1, size: [22, 7], position: [2, -14, 5] },
  // Cyan kicker.
  { color: PALETTE_3D.cyan, intensity: 0.6, size: [6, 3], position: [-9, -9, 8] },
];

export function createStudioEnvironment(renderer: WebGLRenderer, tier: "high" | "low") {
  const scene = new Scene();
  scene.background = new Color(0x000000);

  const room = new Mesh(
    new BoxGeometry(44, 44, 44),
    new MeshBasicMaterial({ color: new Color(PALETTE_3D.paper).multiplyScalar(0.32), side: BackSide }),
  );
  scene.add(room);

  for (const card of CARDS) {
    const mesh = new Mesh(
      new PlaneGeometry(card.size[0], card.size[1]),
      new MeshBasicMaterial({
        color: new Color(card.color).multiplyScalar(card.intensity),
        side: DoubleSide,
        toneMapped: false,
      }),
    );
    mesh.position.set(...card.position);
    mesh.lookAt(0, 0, 0);
    scene.add(mesh);
  }

  const generator = new PMREMGenerator(renderer);
  const target = generator.fromScene(scene, 0.035, 0.1, 100, { size: tier === "high" ? 256 : 128 });
  generator.dispose();
  disposeObject(scene);

  return {
    texture: target.texture as Texture,
    dispose: () => target.dispose(),
  };
}
