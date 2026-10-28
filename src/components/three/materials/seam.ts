import { Color, MeshPhysicalMaterial, MeshStandardMaterial, type Texture, Vector2 } from "three";
import { PALETTE_3D } from "./palette";

/*
 * One shader path for both halves of the mark, blended across world x at
 * uSeamX: left of the seam is the DRAWN maquette (matte white card), right of
 * it is BUILT glass (an art-directed thin film over three's physical
 * lighting). The edge is a pixel-wide antialiased step, so the seam can sweep
 * and stay crisp, and a thin saffron line burns along it.
 *
 * It patches MeshPhysicalMaterial (high tier, with clearcoat) or
 * MeshStandardMaterial (low tier) through onBeforeCompile, so lights, the
 * PMREM environment and tone mapping all behave like stock three.
 *
 *   createSeamMaterial()        the blend, uSeamX animated by the scene
 *   createMaquetteMaterial()    drawn only (seam parked far right)
 *   createIridescentMaterial()  built only (seam parked far left)
 */

export type MaterialTier = "high" | "low";

export interface SeamMaterialOptions {
  /** PMREM texture, usually SceneContext.environment(). */
  envMap: Texture | null;
  tier: MaterialTier;
  /** Half the object's depth along z, in world units: walls darken toward the back, like a model on paper. */
  halfDepth?: number;
  /** World x of the seam. Left of it is drawn, right of it is built. */
  seamX?: number;
}

export interface SeamUniforms {
  /** World x of the seam. */
  uSeamX: { value: number };
  /** Half-width of the burning seam line, world units. 0 hides it. */
  uSeamLineWidth: { value: number };
  uSeamLineColor: { value: Color };
  uSeamLineStrength: { value: number };
  /** Thin-film phase: shifts the colour bands. Drive it, damped, from pointer or scroll. */
  uPhase: { value: number };
  /** How much the film colour changes across the surface, per world unit (x, y). */
  uFilmDirection: { value: Vector2 };
  uFilmStops: { value: Color[] };
  uFresnelColor: { value: Color };
  /** Share of the film colour that is emitted, so the glass never goes dull grey on a light page. */
  uFilmGlow: { value: number };
  uMatteColor: { value: Color };
  uMatteRoughness: { value: number };
  uBuiltRoughness: { value: number };
  uBuiltMetalness: { value: number };
  uHalfDepth: { value: number };
  /** Diffuse multiplier at the back of the walls (fake ambient occlusion). */
  uWallShade: { value: number };
}

const VERTEX_PARS = /* glsl */ `
varying vec3 vSeamPosition;
`;

const VERTEX_MAIN = /* glsl */ `
vec4 seamWorld = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
  seamWorld = batchingMatrix * seamWorld;
#endif
#ifdef USE_INSTANCING
  seamWorld = instanceMatrix * seamWorld;
#endif
vSeamPosition = ( modelMatrix * seamWorld ).xyz;
`;

const FRAGMENT_PARS = /* glsl */ `
uniform float uSeamX;
uniform float uSeamLineWidth;
uniform vec3 uSeamLineColor;
uniform float uSeamLineStrength;
uniform float uPhase;
uniform vec2 uFilmDirection;
uniform vec3 uFilmStops[ 5 ];
uniform vec3 uFresnelColor;
uniform float uFilmGlow;
uniform vec3 uMatteColor;
uniform float uMatteRoughness;
uniform float uBuiltRoughness;
uniform float uBuiltMetalness;
uniform float uHalfDepth;
uniform float uWallShade;
varying vec3 vSeamPosition;

// Cerulean -> cobalt -> azure -> saffron -> light saffron, played forwards
// then backwards so the ramp never wraps with a hard edge.
vec3 seamFilm( float t ) {
  float x = 1.0 - abs( fract( t ) * 2.0 - 1.0 );
  vec3 c = mix( uFilmStops[ 0 ], uFilmStops[ 1 ], smoothstep( 0.0, 0.34, x ) );
  c = mix( c, uFilmStops[ 2 ], smoothstep( 0.32, 0.58, x ) );
  c = mix( c, uFilmStops[ 3 ], smoothstep( 0.6, 0.82, x ) );
  c = mix( c, uFilmStops[ 4 ], smoothstep( 0.82, 1.0, x ) );
  return c;
}
`;

// Runs after the normal is known and before three builds its PhysicalMaterial.
const FRAGMENT_SURFACE = /* glsl */ `
float seamAA = max( fwidth( vSeamPosition.x ), 1e-4 );
float seamBuilt = smoothstep( uSeamX - seamAA, uSeamX + seamAA, vSeamPosition.x );

vec3 seamViewDir = normalize( vViewPosition );
float seamNdV = clamp( dot( normal, seamViewDir ), 0.0, 1.0 );
float seamFilmT = ( 1.0 - seamNdV ) * 1.4
  + dot( normal, vec3( 0.3, 0.6, 0.0 ) ) * 0.35
  + dot( vSeamPosition.xy, uFilmDirection )
  + uPhase;
vec3 seamFilmColor = seamFilm( seamFilmT ) + pow( 1.0 - seamNdV, 5.0 ) * uFresnelColor;

// Walls darken toward the back, where a card model would meet the paper.
float seamWallLight = mix( uWallShade, 1.0, smoothstep( -uHalfDepth, uHalfDepth * 0.5, vSeamPosition.z ) );

diffuseColor.rgb = mix( uMatteColor * seamWallLight, seamFilmColor, seamBuilt );
roughnessFactor = mix( uMatteRoughness, uBuiltRoughness, seamBuilt );
metalnessFactor = mix( 0.0, uBuiltMetalness, seamBuilt );
totalEmissiveRadiance += seamFilmColor * uFilmGlow * seamBuilt * mix( 0.75, 1.0, seamWallLight );

// At least ~1.5 px wide wherever it lands, so it never breaks into dots on the bevels.
float seamLineHalf = max( uSeamLineWidth, seamAA * 0.75 );
float seamLine = 1.0 - smoothstep( seamLineHalf, seamLineHalf + seamAA, abs( vSeamPosition.x - uSeamX ) );
totalEmissiveRadiance += uSeamLineColor * uSeamLineStrength * seamLine * step( 1e-5, uSeamLineWidth );
`;

const FRAGMENT_AFTER_MATERIAL = /* glsl */ `
#ifdef USE_CLEARCOAT
  material.clearcoat *= seamBuilt;
#endif
`;

// The drawn half stays neutral: grey image light and only a faint sheen, so
// the studio's cobalt and saffron cards colour the glass and nothing else.
const FRAGMENT_AFTER_IBL = /* glsl */ `
#if defined( RE_IndirectDiffuse )
  float seamIrradianceLuma = dot( iblIrradiance, vec3( 0.2126, 0.7152, 0.0722 ) );
  iblIrradiance = mix( vec3( seamIrradianceLuma ), iblIrradiance, seamBuilt );
#endif
#if defined( RE_IndirectSpecular )
  float seamRadianceLuma = dot( radiance, vec3( 0.2126, 0.7152, 0.0722 ) );
  radiance = mix( vec3( seamRadianceLuma ) * 0.55, radiance, seamBuilt );
  radiance *= mix( 1.0, seamWallLight, 0.6 );
#endif
`;

function inject(source: string, anchor: string, code: string, where: "before" | "after" = "after") {
  if (!source.includes(anchor)) throw new Error(`seam material: shader anchor ${anchor} not found`);
  return source.replace(anchor, where === "after" ? `${anchor}\n${code}` : `${code}\n${anchor}`);
}

export function createSeamMaterial({ envMap, tier, halfDepth = 0.6, seamX = 0 }: SeamMaterialOptions) {
  const uniforms: SeamUniforms = {
    uSeamX: { value: seamX },
    uSeamLineWidth: { value: 0.016 },
    uSeamLineColor: { value: new Color(PALETTE_3D.saffronLight) },
    uSeamLineStrength: { value: 1.35 },
    uPhase: { value: 0 },
    uFilmDirection: { value: new Vector2(0.05, -0.085) },
    uFilmStops: {
      value: [PALETTE_3D.cerulean, PALETTE_3D.cobalt, PALETTE_3D.azure, PALETTE_3D.saffron, PALETTE_3D.saffronLight].map(
        (hex) => new Color(hex),
      ),
    },
    uFresnelColor: { value: new Color(PALETTE_3D.cream) },
    uFilmGlow: { value: 0.2 },
    uMatteColor: { value: new Color(PALETTE_3D.paperRaised) },
    uMatteRoughness: { value: 0.85 },
    uBuiltRoughness: { value: 0.26 },
    uBuiltMetalness: { value: 0.7 },
    uHalfDepth: { value: halfDepth },
    uWallShade: { value: 0.72 },
  };

  const shared = { color: 0xffffff, roughness: 0.85, metalness: 0, envMap, envMapIntensity: 1 };
  const material =
    tier === "high"
      ? new MeshPhysicalMaterial({ ...shared, clearcoat: 1, clearcoatRoughness: 0.12 })
      : new MeshStandardMaterial(shared);

  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    let vertex = shader.vertexShader;
    vertex = inject(vertex, "#include <common>", VERTEX_PARS);
    vertex = inject(vertex, "#include <project_vertex>", VERTEX_MAIN);
    shader.vertexShader = vertex;

    let fragment = shader.fragmentShader;
    fragment = inject(fragment, "#include <common>", FRAGMENT_PARS);
    fragment = inject(fragment, "#include <lights_physical_fragment>", FRAGMENT_SURFACE, "before");
    fragment = inject(fragment, "#include <lights_physical_fragment>", FRAGMENT_AFTER_MATERIAL);
    fragment = inject(fragment, "#include <lights_fragment_maps>", FRAGMENT_AFTER_IBL);
    shader.fragmentShader = fragment;
  };
  material.customProgramCacheKey = () => `chinvat-seam-${tier}`;

  return { material, uniforms };
}

/** Matte architectural-model card: the DRAWN state on its own. */
export function createMaquetteMaterial(options: Omit<SeamMaterialOptions, "seamX">) {
  const result = createSeamMaterial({ ...options, seamX: 1e4 });
  result.uniforms.uSeamLineWidth.value = 0;
  return result;
}

/** Cerulean-to-saffron glass: the BUILT state on its own. */
export function createIridescentMaterial(options: Omit<SeamMaterialOptions, "seamX">) {
  const result = createSeamMaterial({ ...options, seamX: -1e4 });
  result.uniforms.uSeamLineWidth.value = 0;
  return result;
}
