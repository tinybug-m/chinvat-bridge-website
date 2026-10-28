import { CanvasTexture, Color, Mesh, NoColorSpace, PlaneGeometry, ShaderMaterial } from "three";
import { PALETTE_3D } from "../materials/palette";
import { type Frame, MARK_OUTLINE_PATH, UNITS_PER_PX, pxToWorld } from "./mark-outline";

/*
 * Baked contact shadow: the mark's silhouette blurred once with canvas 2D
 * (no shadow maps, no extra passes) and laid on a plane just behind the
 * object, as if it were mounted proud of the page. A tight occlusion layer
 * hugs the outline; a soft cast layer falls down and right, away from the key
 * light. Right of the seam the shadow picks up a cobalt tint, the colour a
 * glass object throws.
 */

export interface MarkShadowOptions {
  /** Plane extent, in source pixels (usually the stage frame). */
  frame: Frame;
  /** z of the plane, world units (just behind the object's back). */
  z: number;
  /** Texture width in pixels; the height follows the frame aspect. */
  resolution?: number;
  /** Cast offset in source pixels (+x right, +y down). */
  offset?: [number, number];
  /** Blur radii in source pixels. */
  castBlur?: number;
  contactBlur?: number;
  castOpacity?: number;
  contactOpacity?: number;
}

export interface MarkShadowUniforms {
  uSeamX: { value: number };
  uOpacity: { value: number };
}

const VERTEX = /* glsl */ `
varying vec2 vUv;
varying float vShadowX;
void main() {
  vUv = uv;
  vec4 world = modelMatrix * vec4( position, 1.0 );
  vShadowX = world.x;
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

const FRAGMENT = /* glsl */ `
uniform sampler2D uMap;
uniform vec3 uColor;
uniform vec3 uBuiltColor;
uniform float uOpacity;
uniform float uSeamX;
uniform float uSeamOffset;
varying vec2 vUv;
varying float vShadowX;
void main() {
  float alpha = texture2D( uMap, vUv ).a * uOpacity;
  float soft = max( fwidth( vShadowX ), 1e-4 ) * 10.0;
  float built = smoothstep( uSeamX - soft, uSeamX + soft, vShadowX - uSeamOffset );
  gl_FragColor = vec4( mix( uColor, uBuiltColor, built ), alpha );
  #include <colorspace_fragment>
}
`;

function paintShadow(options: Required<Omit<MarkShadowOptions, "z">>) {
  const { frame, resolution, offset, castBlur, contactBlur, castOpacity, contactOpacity } = options;
  const width = resolution;
  const height = Math.round((resolution * frame.height) / frame.width);
  const scale = width / frame.width;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return canvas;

  const path = new Path2D(MARK_OUTLINE_PATH);
  // Draw the shape off-canvas and keep only its shadow: shadowBlur works in
  // every browser, unlike ctx.filter. Shadow offsets ignore the transform.
  const away = width * 3;
  const layer = (blur: number, opacity: number, dx: number, dy: number) => {
    context.save();
    context.setTransform(scale, 0, 0, scale, -frame.x * scale - away, -frame.y * scale);
    context.shadowColor = `rgba(255, 255, 255, ${opacity})`;
    context.shadowBlur = blur * scale;
    context.shadowOffsetX = away + dx * scale;
    context.shadowOffsetY = dy * scale;
    context.fillStyle = "#fff";
    context.fill(path, "evenodd");
    context.restore();
  };
  layer(castBlur, castOpacity, offset[0], offset[1]);
  layer(contactBlur, contactOpacity, offset[0] * 0.18, offset[1] * 0.18);
  return canvas;
}

export function createMarkShadow({
  frame,
  z,
  resolution = 768,
  offset = [14, 22],
  castBlur = 30,
  contactBlur = 7,
  castOpacity = 0.5,
  contactOpacity = 0.75,
}: MarkShadowOptions) {
  const canvas = paintShadow({ frame, resolution, offset, castBlur, contactBlur, castOpacity, contactOpacity });
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = NoColorSpace;

  const uniforms = {
    uMap: { value: texture },
    uColor: { value: new Color(PALETTE_3D.ink) },
    uBuiltColor: { value: new Color(PALETTE_3D.cerulean).lerp(new Color(PALETTE_3D.cobalt), 0.35) },
    uOpacity: { value: 0.42 },
    uSeamX: { value: 0 },
    uSeamOffset: { value: offset[0] * UNITS_PER_PX },
  };
  const material = new ShaderMaterial({
    uniforms,
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
    transparent: true,
    depthWrite: false,
    toneMapped: false,
  });

  const geometry = new PlaneGeometry(frame.width * UNITS_PER_PX, frame.height * UNITS_PER_PX);
  const mesh = new Mesh(geometry, material);
  const [cx, cy] = pxToWorld(frame.x + frame.width / 2, frame.y + frame.height / 2);
  mesh.position.set(cx, cy, z);
  mesh.renderOrder = -1;

  return { mesh, uniforms: uniforms as MarkShadowUniforms & typeof uniforms, texture };
}
