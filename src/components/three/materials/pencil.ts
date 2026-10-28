import { Color, ShaderMaterial } from "three";
import { PALETTE_3D } from "./palette";

/*
 * Ink pencil lines for the DRAWN state: hairlines in ink at low opacity that
 * vanish right of the seam, so only the drawn part of an object carries its
 * drawing. Use with LineSegments built from outlines or EdgesGeometry.
 */

export type PencilUniforms = {
  uSeamX: { value: number };
  uColor: { value: Color };
  uOpacity: { value: number };
};

const VERTEX = /* glsl */ `
varying float vPencilX;
void main() {
  vec4 world = modelMatrix * vec4( position, 1.0 );
  vPencilX = world.x;
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

const FRAGMENT = /* glsl */ `
uniform float uSeamX;
uniform vec3 uColor;
uniform float uOpacity;
varying float vPencilX;
void main() {
  float aa = max( fwidth( vPencilX ), 1e-4 );
  float drawn = 1.0 - smoothstep( uSeamX - aa, uSeamX + aa, vPencilX );
  gl_FragColor = vec4( uColor, uOpacity * drawn );
  #include <colorspace_fragment>
}
`;

export function createPencilMaterial({ opacity = 0.55, seamX = 0 }: { opacity?: number; seamX?: number } = {}) {
  const uniforms: PencilUniforms = {
    uSeamX: { value: seamX },
    uColor: { value: new Color(PALETTE_3D.ink) },
    uOpacity: { value: opacity },
  };
  const material = new ShaderMaterial({
    uniforms,
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
    transparent: true,
    depthWrite: false,
    toneMapped: false,
  });
  return { material, uniforms };
}
