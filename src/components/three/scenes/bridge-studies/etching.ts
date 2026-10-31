import {
  Color,
  EdgesGeometry,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  ShaderMaterial,
  Vector3,
} from "three";
import type { SceneContext, SceneInstance, SceneModule } from "../../core/types";
import { PALETTE_3D } from "../../materials/palette";
import { BLADE_WIDTH, BLADES, type Blade, KNIFE, bladeFrames, createBlades, widening } from "./blades";
import { spearsScene } from "./spears-scene";

/*
 * Nine Spears as an engraving: the 3D bridge printed like a plate from an
 * old book. Every surface is drawn in ink hatching on warm paper (one set of
 * lines where the light starts to turn, crossed where it falls away, denser
 * again in shadow) and every edge is inked. Today it is a razor between two
 * plinths; built, nine blades fan out from the centre. It still turns in
 * the hand, and the hatching stays on the page grid as it turns, as a print
 * would.
 *
 * One shader for blades and plinths (the plinths fade into the paper by
 * their vertex alpha, as on the Approach); no fog, no glow.
 */

export const ETCHING_PAPER = "#efe5cf";
const THICK = 0.2;

const VERTEX = /* glsl */ `
#ifdef FADE
attribute vec4 color;
varying float vAlpha;
#endif
varying vec3 vNormal;
void main() {
  vNormal = normalize( normalMatrix * normal );
  #ifdef FADE
  vAlpha = color.a;
  #endif
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
`;

const FRAGMENT = /* glsl */ `
uniform vec3 uLight;
uniform vec3 uInk;
uniform vec3 uPaper;
uniform float uDpr;
varying vec3 vNormal;
#ifdef FADE
varying float vAlpha;
#endif

// One family of parallel lines, its width growing with the darkness asked of it.
float hatch( vec2 p, vec2 direction, float spacing, float darkness ) {
  float d = abs( fract( dot( p, direction ) / spacing ) - 0.5 ) * spacing;
  float width = clamp( darkness, 0.0, 1.0 ) * spacing * 0.32;
  return 1.0 - smoothstep( width - 0.6, width + 0.6, d );
}

void main() {
  float light = clamp( dot( normalize( vNormal ), uLight ), 0.0, 1.0 ) * 0.8 + 0.2;
  vec2 p = gl_FragCoord.xy / uDpr;
  float ink = hatch( p, normalize( vec2( 1.0, 0.55 ) ), 5.0, ( 0.92 - light ) * 3.0 );
  ink = max( ink, hatch( p, normalize( vec2( -0.55, 1.0 ) ), 5.0, ( 0.62 - light ) * 3.0 ) );
  ink = max( ink, hatch( p, normalize( vec2( 1.0, -1.0 ) ), 3.5, ( 0.4 - light ) * 3.5 ) );
  vec3 colour = mix( uPaper, uInk, ink * 0.92 );
  float alpha = 1.0;
  #ifdef FADE
  alpha = vAlpha;
  #endif
  gl_FragColor = vec4( colour, alpha );
  #include <colorspace_fragment>
}
`;

function hatchMaterial(dpr: number, fade = false) {
  return new ShaderMaterial({
    uniforms: {
      uLight: { value: new Vector3() },
      uInk: { value: new Color(PALETTE_3D.ink) },
      uPaper: { value: new Color(ETCHING_PAPER) },
      uDpr: { value: dpr },
    },
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
    defines: fade ? { FADE: 1 } : {},
    transparent: fade,
    depthWrite: !fade,
  });
}

export function createScene(context: SceneContext): SceneInstance {
  return spearsScene(context, ({ scene, camera, group, layout }) => {
    // A printed plate: no fog and no glow, only paper and ink.
    scene.fog = null;
    for (const child of [...scene.children]) if (child instanceof Mesh && child.renderOrder === -1) scene.remove(child);

    const dpr = context.size.dpr;
    const solid = hatchMaterial(dpr);
    const fading = hatchMaterial(dpr, true);
    const ink = new LineBasicMaterial({ color: PALETTE_3D.ink, transparent: true, opacity: 0.85 });
    const fadingInk = new LineBasicMaterial({ color: PALETTE_3D.ink, transparent: true, opacity: 0.45 });

    // The setting's plinths, re-inked: hatched faces and their top edges.
    for (const child of [...group.children]) {
      if (!(child instanceof Mesh)) continue;
      child.material = fading;
      const edges = new LineSegments(new EdgesGeometry(child.geometry), fadingInk);
      edges.position.copy(child.position);
      group.add(edges);
    }

    const frames = bladeFrames(layout, THICK);
    const blades = createBlades(frames, BLADES, KNIFE, solid, ink);
    group.add(blades.mesh, blades.lines!);

    // Light from the upper left, fixed to the world; turned into view space each frame for the shader.
    const light = new Vector3(-0.35, 0.9, 0.25).normalize();
    const view = new Vector3();

    return {
      layOut(built) {
        const list: Blade[] = [];
        for (let i = 0; i < BLADES; i++) {
          const { rank, p } = widening(built, i);
          list.push({
            z: rank * (BLADE_WIDTH + 0.03) * p,
            roll: (Math.PI / 2) * (1 - p) * (rank % 2 ? -1 : 1),
            width: BLADE_WIDTH,
            thick: THICK,
            offset: 0,
          });
        }
        blades.write(list);
      },
      extra() {
        view.copy(light).transformDirection(camera.matrixWorldInverse);
        solid.uniforms.uLight.value.copy(view);
        fading.uniforms.uLight.value.copy(view);
        solid.uniforms.uDpr.value = context.size.dpr;
        fading.uniforms.uDpr.value = context.size.dpr;
      },
    };
  });
}

const etchingStudy: SceneModule = { createScene };
export default etchingStudy;
