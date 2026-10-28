import {
  BoxGeometry,
  BufferGeometry,
  Color,
  DirectionalLight,
  DynamicDrawUsage,
  EdgesGeometry,
  Float32BufferAttribute,
  Group,
  HemisphereLight,
  InstancedMesh,
  LineSegments,
  Matrix4,
  PerspectiveCamera,
  Points,
  Quaternion,
  Scene,
  ShaderMaterial,
  TorusGeometry,
  Vector3,
} from "three";
import { clamp, damp } from "../../core/motion";
import { devParam } from "../../core/switches";
import type { SceneContext, SceneInstance, SceneModule, StageSize } from "../../core/types";
import { PALETTE_3D } from "../../materials/palette";
import { createSeamMaterial } from "../../materials/seam";
import { METHOD_FRAME, METHOD_NODE } from "./config";

/*
 * The Method node: one space-frame cell that goes from surveyed to built as
 * the four steps scroll by.
 *
 *   step 0  Discover  point cloud: the cell as survey points on a dotted ground grid
 *   step 1  Define    wireframe: ink edges draw in, the points dissolve
 *   step 2  Build     maquette: matte card struts and rings grow inside the drawing
 *   step 3  Improve   material: the seam sweeps across and the cell turns to thin film
 *
 * Inputs (StageHandle.set):
 *   step  0..3  continuous; the scene damps toward it, so jumps animate
 *
 * Capture (?poster=1&method=0..3): renders that state exactly.
 * Four draw calls: points, lines, struts (instanced), rings (instanced).
 */

const DEG = Math.PI / 180;
const X_AXIS = new Vector3(1, 0, 0);
const Z_AXIS = new Vector3(0, 0, 1);

/** Seeded PRNG (mulberry32): the survey is the same on every visit and in the posters. */
function random(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const smooth = (t: number) => t * t * (3 - 2 * t);

const POINTS_VERTEX = /* glsl */ `
attribute float aKind;
attribute float aSeed;
uniform float uSize;
uniform float uDpr;
uniform float uObject;
uniform float uGround;
varying float vAlpha;
void main() {
  float amount = aKind > 0.5 ? uGround : uObject;
  // Dissolve in seeded order rather than all at once.
  vAlpha = clamp( ( amount - aSeed * 0.8 ) / 0.2, 0.0, 1.0 );
  vAlpha *= aKind > 1.5 ? 0.45 : ( aKind > 0.5 ? 0.55 : 0.9 );
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  gl_PointSize = uSize * uDpr * ( aKind > 1.5 ? 0.8 : 1.0 );
}
`;

const POINTS_FRAGMENT = /* glsl */ `
uniform vec3 uColor;
varying float vAlpha;
void main() {
  if ( vAlpha <= 0.001 ) discard;
  vec2 c = gl_PointCoord - 0.5;
  float r = length( c );
  float aa = fwidth( r );
  float disc = 1.0 - smoothstep( 0.5 - aa, 0.5, r );
  if ( disc <= 0.0 ) discard;
  gl_FragColor = vec4( uColor, vAlpha * disc );
  #include <colorspace_fragment>
}
`;

const LINES_VERTEX = /* glsl */ `
attribute float aT;
attribute float aOrder;
attribute float aKind;
varying float vT;
varying float vOrder;
varying float vKind;
varying float vLineX;
void main() {
  vec4 world = modelMatrix * vec4( position, 1.0 );
  vLineX = world.x;
  vT = aT;
  vOrder = aOrder;
  vKind = aKind;
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

const LINES_FRAGMENT = /* glsl */ `
uniform float uDraw;
uniform float uObject;
uniform float uGround;
uniform float uSeamX;
uniform vec3 uColor;
varying float vT;
varying float vOrder;
varying float vKind;
varying float vLineX;
void main() {
  // Each segment draws from its start, staggered by its order.
  float reach = clamp( ( uDraw - vOrder * 0.55 ) / 0.45, 0.0, 1.0 );
  if ( vT > reach ) discard;
  float alpha;
  if ( vKind > 0.5 ) {
    alpha = uGround;
  } else {
    float aa = max( fwidth( vLineX ), 1e-4 );
    // Pencil vanishes on the built side of the seam.
    alpha = uObject * ( 1.0 - smoothstep( uSeamX - aa, uSeamX + aa, vLineX ) );
  }
  if ( alpha <= 0.001 ) discard;
  gl_FragColor = vec4( uColor, alpha );
  #include <colorspace_fragment>
}
`;

interface Strut {
  position: Vector3;
  quaternion: Quaternion;
  length: number;
}

interface Ring {
  position: Vector3;
  quaternion: Quaternion;
}

export function createScene(context: SceneContext): SceneInstance {
  const { quality, capture } = context;
  const tier = quality.tier === "low" ? "low" : "high";
  const N = METHOD_NODE;
  const rand = random(N.seed);
  const R = N.radius;
  const groundY = -R - N.ringRadius - 0.12;

  const scene = new Scene();

  const camera = new PerspectiveCamera(20, 4 / 3, 0.5, 200);
  const elevation = N.elevation * DEG;
  const target = new Vector3(0, METHOD_FRAME.centreY, 0);
  camera.position.set(0, target.y + Math.sin(elevation) * N.distance, Math.cos(elevation) * N.distance);
  camera.lookAt(target);

  const key = new DirectionalLight(0xffffff, 2.2);
  key.position.set(-6, 9, 7);
  const fill = new DirectionalLight(0xe4ebf1, 0.5);
  fill.position.set(8, 2, 5);
  const ambient = new HemisphereLight(0xffffff, 0xd9d3c7, 1);
  scene.add(key, key.target, fill, fill.target, ambient);

  // The cell turns as a whole; lights and camera stay, so the film catches new light.
  const cell = new Group();
  scene.add(cell);

  // --- Structure -----------------------------------------------------------
  const top = new Vector3(0, R, 0);
  const bottom = new Vector3(0, -R, 0);
  const centre = new Vector3(0, 0, 0);
  const equator = [new Vector3(R, 0, 0), new Vector3(0, 0, R), new Vector3(-R, 0, 0), new Vector3(0, 0, -R)];
  const joints = [top, bottom, ...equator, centre];

  const pairs: [Vector3, Vector3][] = [];
  for (let i = 0; i < 4; i++) {
    pairs.push([top, equator[i]], [equator[i], bottom], [equator[i], equator[(i + 1) % 4]]);
  }
  for (const joint of [top, bottom, ...equator]) pairs.push([centre, joint]);

  const gap = N.ringRadius * 0.9;
  const struts: Strut[] = pairs.map(([a, b]) => {
    const direction = b.clone().sub(a);
    const length = direction.length() - gap * 2;
    return {
      position: a.clone().add(b).multiplyScalar(0.5),
      quaternion: new Quaternion().setFromUnitVectors(X_AXIS, direction.normalize()),
      length,
    };
  });

  const centreAxis = new Vector3(0.35, 0.55, 1).normalize();
  const rings: Ring[] = joints.map((joint) => ({
    position: joint.clone(),
    // Each ring threads the axis that runs to the centre; the centre ring faces the viewer.
    quaternion: new Quaternion().setFromUnitVectors(
      Z_AXIS,
      joint.lengthSq() > 0 ? joint.clone().normalize() : centreAxis,
    ),
  }));

  const { material, uniforms } = createSeamMaterial({ envMap: context.environment(), tier, halfDepth: R, seamX: 1e3 });
  uniforms.uSeamLineWidth.value = 0.018;
  uniforms.uSeamLineStrength.value = 1.5;
  uniforms.uMatteColor.value.setHex(0xfbfaf7);
  uniforms.uFilmGlow.value = 0.24;
  // The film bands run across the cell's height rather than its narrow struts.
  uniforms.uFilmDirection.value.set(0.06, -0.11);

  const strutGeometry = new BoxGeometry(1, N.strut, N.strut);
  const ringGeometry = new TorusGeometry(N.ringRadius, N.ringTube, 4, 20);
  const strutMesh = new InstancedMesh(strutGeometry, material, struts.length);
  const ringMesh = new InstancedMesh(ringGeometry, material, rings.length);
  for (const mesh of [strutMesh, ringMesh]) {
    mesh.instanceMatrix.setUsage(DynamicDrawUsage);
    mesh.frustumCulled = false;
    cell.add(mesh);
  }

  // --- Wireframe: the box edges of every strut and ring, plus a drawn plinth ---
  const linePositions: number[] = [];
  const lineT: number[] = [];
  const lineOrder: number[] = [];
  const lineKind: number[] = [];
  const pushSegment = (a: Vector3, b: Vector3, order: number, kind: number) => {
    linePositions.push(a.x, a.y, a.z, b.x, b.y, b.z);
    lineT.push(0, 1);
    lineOrder.push(order, order);
    lineKind.push(kind, kind);
  };
  const matrix = new Matrix4();
  const a = new Vector3();
  const b = new Vector3();
  const scale = new Vector3();

  // Slightly oversized, so the edges sit just outside the solid and never z-fight.
  const strutEdges = new EdgesGeometry(new BoxGeometry(1, N.strut * 1.06, N.strut * 1.06));
  const ringEdges = new EdgesGeometry(new TorusGeometry(N.ringRadius, N.ringTube * 1.06, 4, 20), 30);
  const addEdges = (edges: BufferGeometry, transform: Matrix4, order: number) => {
    const source = edges.getAttribute("position");
    for (let i = 0; i < source.count; i += 2) {
      a.fromBufferAttribute(source, i).applyMatrix4(transform);
      b.fromBufferAttribute(source, i + 1).applyMatrix4(transform);
      pushSegment(a, b, order, 0);
    }
  };
  // Draw order runs top to bottom, like a hand drawing the cell.
  const orderOf = (y: number) => clamp(0.08 + ((R - y) / (2 * R)) * 0.84 + (rand() - 0.5) * 0.1);
  for (const strut of struts) {
    matrix.compose(strut.position, strut.quaternion, scale.set(strut.length, 1, 1));
    addEdges(strutEdges, matrix, orderOf(strut.position.y));
  }
  for (const ring of rings) {
    matrix.compose(ring.position, ring.quaternion, scale.set(1, 1, 1));
    addEdges(ringEdges, matrix, orderOf(ring.position.y));
  }
  strutEdges.dispose();
  ringEdges.dispose();

  // Plinth: the ground ellipse and two dashed diameters.
  const ground = (x: number, z: number) => new Vector3(x, groundY, z);
  const steps = 96;
  for (let i = 0; i < steps; i++) {
    const t0 = (i / steps) * Math.PI * 2;
    const t1 = ((i + 1) / steps) * Math.PI * 2;
    const r = N.groundRadius;
    pushSegment(ground(Math.cos(t0) * r, Math.sin(t0) * r), ground(Math.cos(t1) * r, Math.sin(t1) * r), i / steps, 1);
  }
  const dash = 0.16;
  for (const [dx, dz] of [
    [1, 0],
    [0, 1],
  ]) {
    const reach = N.groundRadius + 0.35;
    for (let d = -reach; d < reach; d += dash * 2) {
      const order = (d + reach) / (2 * reach);
      pushSegment(ground(dx * d, dz * d), ground(dx * (d + dash), dz * (d + dash)), order, 1);
    }
  }

  const lineGeometry = new BufferGeometry();
  lineGeometry.setAttribute("position", new Float32BufferAttribute(linePositions, 3));
  lineGeometry.setAttribute("aT", new Float32BufferAttribute(lineT, 1));
  lineGeometry.setAttribute("aOrder", new Float32BufferAttribute(lineOrder, 1));
  lineGeometry.setAttribute("aKind", new Float32BufferAttribute(lineKind, 1));
  lineGeometry.computeBoundingSphere();
  const lineUniforms = {
    uDraw: { value: 0 },
    uObject: { value: 0 },
    uGround: { value: 0 },
    uSeamX: { value: 1e3 },
    uColor: { value: new Color(PALETTE_3D.ink) },
  };
  const lineMaterial = new ShaderMaterial({
    uniforms: lineUniforms,
    vertexShader: LINES_VERTEX,
    fragmentShader: LINES_FRAGMENT,
    transparent: true,
    depthWrite: false,
    toneMapped: false,
  });
  const lines = new LineSegments(lineGeometry, lineMaterial);
  lines.renderOrder = 2;
  cell.add(lines);

  // --- Survey: points scanned off every surface, a ground grid and strays ---
  const pointPositions: number[] = [];
  const pointKind: number[] = [];
  const pointSeed: number[] = [];
  const pushPoint = (p: Vector3, kind: number) => {
    pointPositions.push(p.x, p.y, p.z);
    pointKind.push(kind);
    pointSeed.push(rand());
  };
  const jitter = (amount: number) => (rand() + rand() - 1) * amount;
  const surface = new Vector3();
  const density = tier === "high" ? 64 : 40; // points per world unit of strut
  for (const strut of struts) {
    matrix.compose(strut.position, strut.quaternion, scale.set(1, 1, 1));
    const count = Math.round(strut.length * density);
    const h = N.strut / 2;
    for (let i = 0; i < count; i++) {
      const along = (rand() - 0.5) * strut.length;
      const across = (rand() - 0.5) * N.strut;
      const face = Math.floor(rand() * 4);
      surface.set(
        along,
        face < 2 ? (face === 0 ? h : -h) : across,
        face < 2 ? across : face === 2 ? h : -h,
      );
      surface.applyMatrix4(matrix);
      surface.x += jitter(0.012);
      surface.y += jitter(0.012);
      surface.z += jitter(0.012);
      pushPoint(surface, 0);
    }
  }
  for (const ring of rings) {
    matrix.compose(ring.position, ring.quaternion, scale.set(1, 1, 1));
    const count = tier === "high" ? 90 : 56;
    for (let i = 0; i < count; i++) {
      const u = rand() * Math.PI * 2;
      const v = rand() * Math.PI * 2;
      const r = N.ringRadius + N.ringTube * Math.cos(v);
      surface.set(r * Math.cos(u), r * Math.sin(u), N.ringTube * Math.sin(v)).applyMatrix4(matrix);
      pushPoint(surface, 0);
    }
  }
  const gridStep = 0.32;
  for (let x = -N.groundRadius; x <= N.groundRadius + 1e-6; x += gridStep) {
    for (let z = -N.groundRadius; z <= N.groundRadius + 1e-6; z += gridStep) {
      if (x * x + z * z > N.groundRadius * N.groundRadius) continue;
      pushPoint(ground(x, z), 1);
    }
  }
  for (let i = 0; i < 90; i++) {
    // Strays: a scan is never clean.
    surface.set(jitter(R * 1.3), jitter(R * 1.1), jitter(R * 1.3));
    pushPoint(surface, 2);
  }
  const pointGeometry = new BufferGeometry();
  pointGeometry.setAttribute("position", new Float32BufferAttribute(pointPositions, 3));
  pointGeometry.setAttribute("aKind", new Float32BufferAttribute(pointKind, 1));
  pointGeometry.setAttribute("aSeed", new Float32BufferAttribute(pointSeed, 1));
  pointGeometry.computeBoundingSphere();
  const pointUniforms = {
    uSize: { value: 2.4 },
    uDpr: { value: 1 },
    uObject: { value: 1 },
    uGround: { value: 1 },
    uColor: { value: new Color(PALETTE_3D.ink) },
  };
  const pointMaterial = new ShaderMaterial({
    uniforms: pointUniforms,
    vertexShader: POINTS_VERTEX,
    fragmentShader: POINTS_FRAGMENT,
    transparent: true,
    depthWrite: false,
    toneMapped: false,
  });
  const points = new Points(pointGeometry, pointMaterial);
  points.renderOrder = 3;
  cell.add(points);

  // --- State ----------------------------------------------------------------
  const captureStep = capture ? clamp(Number(devParam("method") ?? 0) || 0, 0, 3) : 0;
  let step = capture ? captureStep : clamp(context.input("step", 0), 0, 3);
  let appliedStep = Number.NaN;
  const reach = R + N.ringRadius + 0.2;

  function layOut(solid: number) {
    const visible = solid > 0.002;
    strutMesh.visible = visible;
    ringMesh.visible = visible;
    if (!visible) return;
    const thickness = Math.max(solid, 0.002);
    struts.forEach((strut, index) => {
      strutMesh.setMatrixAt(index, matrix.compose(strut.position, strut.quaternion, scale.set(strut.length, thickness, thickness)));
    });
    rings.forEach((ring, index) => {
      ringMesh.setMatrixAt(index, matrix.compose(ring.position, ring.quaternion, scale.setScalar(0.35 + 0.65 * thickness)));
    });
    strutMesh.instanceMatrix.needsUpdate = true;
    ringMesh.instanceMatrix.needsUpdate = true;
  }

  function apply() {
    if (step === appliedStep) return;
    appliedStep = step;
    const s = step;
    // Discover → Define: the survey dissolves while the drawing arrives.
    pointUniforms.uObject.value = 1 - smooth(clamp(s / 0.85));
    pointUniforms.uGround.value = 1 - smooth(clamp(s / 0.95));
    lineUniforms.uDraw.value = smooth(clamp(s / 0.95));
    // Define → Build: the drawing steps back to construction lines as material fills it.
    const solid = smooth(clamp(s - 1));
    lineUniforms.uObject.value = 0.8 - 0.4 * solid;
    lineUniforms.uGround.value = 0.5 * smooth(clamp(s / 0.95));
    // Build → Improve: the seam sweeps right to left across the cell.
    const sweep = smooth(clamp((s - 2) / 0.92));
    const seamX = sweep <= 0 ? 1e3 : sweep >= 1 ? -1e3 : reach - sweep * 2 * reach;
    uniforms.uSeamX.value = seamX;
    lineUniforms.uSeamX.value = seamX;
    uniforms.uPhase.value = 0.04 + s * 0.07;
    cell.rotation.y = (N.yaw + (s / 3) * N.turn) * DEG;
    layOut(solid);
  }

  function resize(size: StageSize) {
    const aspect = size.width / Math.max(1, size.height);
    // "contain" the 4:3 frame, whatever the canvas shape.
    const halfHeight =
      aspect >= METHOD_FRAME.width / METHOD_FRAME.height ? METHOD_FRAME.height / 2 : METHOD_FRAME.width / aspect / 2;
    camera.fov = (2 * Math.atan(halfHeight / N.distance)) / DEG;
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
    pointUniforms.uDpr.value = size.dpr;
    // Points scale a little with the stage so the cloud reads as dense, never as dust.
    pointUniforms.uSize.value = clamp(size.width / 260, 1.6, 2.6);
    appliedStep = Number.NaN;
    apply();
  }

  function update(deltaMs: number) {
    if (capture) {
      apply();
      return false;
    }
    const goal = clamp(context.input("step", step), 0, 3);
    step = damp(step, goal, 3.2, deltaMs);
    const moving = Math.abs(step - goal) > 1e-3;
    if (!moving) step = goal;
    apply();
    return moving;
  }

  return { scene, camera, resize, update };
}

const methodScene: SceneModule = { createScene };
export default methodScene;
