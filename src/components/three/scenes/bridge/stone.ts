import {
  BufferAttribute,
  BufferGeometry,
  BoxGeometry,
  CanvasTexture,
  ExtrudeGeometry,
  RepeatWrapping,
  Shape,
  SRGBColorSpace,
} from "three";

/*
 * Pieces for the Bridge's stone path: a chamfered slab, a plinth block that
 * fades into the page, and the faint travertine banding they share. All of it
 * is generated, so there are no model or texture files to load.
 */

/** Seeded PRNG (mulberry32), so the path is the same on every visit and in the posters. */
export function random(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function smooth(t: number) {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
}

export function mix(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/** A slab with one chamfer all round, centred on the origin: length along x, thickness along y, depth along z. */
export function chamferedSlab(length: number, thickness: number, depth: number, bevel: number): BufferGeometry {
  const hx = length / 2 - bevel;
  const hy = thickness / 2 - bevel;
  const shape = new Shape();
  shape.moveTo(-hx, -hy);
  shape.lineTo(hx, -hy);
  shape.lineTo(hx, hy);
  shape.lineTo(-hx, hy);
  shape.closePath();
  const inner = depth - bevel * 2;
  const geometry = new ExtrudeGeometry(shape, {
    depth: inner,
    bevelEnabled: true,
    bevelSize: bevel,
    bevelThickness: bevel,
    bevelSegments: 1,
    steps: 1,
  });
  geometry.translate(0, 0, -inner / 2);
  return geometry;
}

/** A block whose vertex alpha runs out going down, so a plinth dissolves into the page instead of ending. */
export function fadedBlock(width: number, height: number, depth: number, fadeFrom: number, fadeTo: number): BufferGeometry {
  const geometry = new BoxGeometry(width, height, depth, 1, 10, 1);
  const position = geometry.attributes.position;
  const colors = new Float32Array(position.count * 4);
  for (let i = 0; i < position.count; i++) {
    colors.set([1, 1, 1, 1 - smooth((-position.getY(i) - fadeFrom) / (fadeTo - fadeFrom))], i * 4);
  }
  geometry.setAttribute("color", new BufferAttribute(colors, 4));
  return geometry;
}

/** Faint horizontal banding and pitting, near white so it only modulates the stone colour. */
export function stoneTexture(): CanvasTexture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const rand = random(31);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 70; i++) {
    const y = rand() * size;
    const h = 0.6 + rand() * 2.6;
    const alpha = 0.03 + rand() * 0.07;
    ctx.fillStyle = rand() > 0.35 ? `rgba(140, 134, 120, ${alpha * 0.45})` : `rgba(255, 252, 240, ${alpha * 1.4})`;
    ctx.fillRect(0, y, size, h);
  }
  for (let i = 0; i < 90; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const w = 1 + rand() * 5;
    ctx.fillStyle = `rgba(130, 120, 104, ${0.04 + rand() * 0.06})`;
    ctx.beginPath();
    ctx.ellipse(x, y, w, 0.5 + rand() * 0.9, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.colorSpace = SRGBColorSpace;
  texture.repeat.set(0.2, 0.2);
  texture.anisotropy = 4;
  return texture;
}

/** A soft cream-to-saffron glow, drawn once into a small canvas: the warm light behind the far end. */
export function glowTexture(): CanvasTexture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const glow = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  glow.addColorStop(0, "rgba(242, 228, 184, 0.5)");
  glow.addColorStop(0.45, "rgba(246, 238, 214, 0.26)");
  glow.addColorStop(1, "rgba(246, 244, 239, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, size, size);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}
