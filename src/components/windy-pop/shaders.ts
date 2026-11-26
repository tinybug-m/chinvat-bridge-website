/* GLSL for Windy Pup. Colours are sRGB and written straight out; light layers blend additively. */

/*
 * The duo palette (scene input `palette` = 2) compiles with INK and DUO: inside the window (input
 * `window`, a white plate) the dog is the night dog, its light added over its own dark glass;
 * outside it is drawn in ink. With no window the whole stage is inside (the corner dog).
 * Decided per pixel, so a dog half out of the window is half colour, half ink. uWindow is the window in gl_FragCoord pixels (x0, y0, x1, y1); uView is the drawing buffer's
 * width and height and the soft edge's half-width, in the same pixels.
 */
const DUO = /* glsl */ `
  uniform vec4 uWindow;
  uniform vec3 uView;
  uniform float uDensity;
  /* Signed distance from the window's edge in pixels, negative inside. */
  float windowEdge(vec2 at) {
    vec2 d = max(uWindow.xy - at, at - uWindow.zw);
    return max(d.x, d.y);
  }
  float inWindow(vec2 at) {
    return 1.0 - smoothstep(-uView.z, uView.z, windowEdge(at));
  }
`;

/*
 * The ink palette (scene input `palette` = 1) compiles these shaders with `#define INK`: the dog is
 * drawn in navy ink with saffron and blue accents for a paper page, blended as normal premultiplied
 * alpha. Right of the seam (input `seam`) it is built: the night light on its dark glass, added as at
 * night. Without INK the shaders are exactly the night ones.
 */
const INK = /* glsl */ `
  #ifdef INK
  uniform float uSeam;
  varying vec3 vInk;
  varying float vBuilt;
  /* Site tokens: ink, saffron-600 and azure-400. */
  vec3 inked(vec3 c, float glint) {
    float warm = clamp((c.r - c.b) * 2.4, 0.0, 1.0);
    vec3 ink = mix(vec3(0.043, 0.102, 0.149), vec3(0.745, 0.549, 0.247), warm);
    return mix(ink, vec3(0.11, 0.557, 0.765), clamp(glint * 1.2, 0.0, 1.0));
  }
  /* 0 drawn, 1 built: across a soft vertical seam at uSeam, in clip space. */
  float built(vec4 clip) {
    return smoothstep(uSeam - 0.07, uSeam + 0.07, clip.x / clip.w);
  }
  #ifdef DUO
  ${DUO}
  #endif
  #endif
`;

/*
 * The rig, packed into one attribute (WebGL guarantees only 16): aRig.x is how much of a head
 * point the lower jaw carries; aRig.y and aRig.z are a trunk point's leg and how firmly it
 * belongs to it (pose.ts legOf).
 */
/* The lower jaw swings about a hinge beside the ears. */
const JAW = /* glsl */ `
  attribute vec3 aRig;
  uniform float uJaw;
  uniform vec2 uJawHinge;
  vec3 jawed(vec3 p) {
    float a = uJaw * aRig.x;
    vec2 q = p.yz - uJawHinge;
    p.yz = uJawHinge + vec2(q.x * cos(a) - q.y * sin(a), q.x * sin(a) + q.y * cos(a));
    return p;
  }
`;

/*
 * The trot. Each point of the trunk knows its leg and how firmly it belongs to it; the leg swings about its shoulder or hip by that share of the angle, so the
 * coat bends where leg meets body instead of tearing, and the paw folds up as it comes forward.
 */
const GAIT = /* glsl */ `
  uniform vec4 uLegSwing;
  uniform vec4 uLegLift;
  uniform vec4 uLegPivots;
  vec3 gait(vec3 p, vec3 rest) {
    if (aRig.z <= 0.0) return p;
    vec4 pick = vec4(equal(vec4(aRig.y), vec4(0.0, 1.0, 2.0, 3.0)));
    float a = dot(uLegSwing, pick) * aRig.z;
    float paw = dot(uLegLift, pick) * aRig.z * smoothstep(0.44, 0.06, rest.y);
    bool front = aRig.y < 1.5;
    vec2 pivot = front ? uLegPivots.xy : uLegPivots.zw;
    vec2 q = p.yz - pivot;
    float c = cos(a);
    float s = sin(a);
    p.yz = pivot + vec2(q.x * c + q.y * s, q.y * c - q.x * s);
    p.y += paw;
    p.z -= paw * (front ? 0.75 : 0.3);
    return p;
  }
`;

const COMMON = /* glsl */ `
  ${JAW}
  ${GAIT}
  ${INK}
  uniform float uTime;
  uniform float uClock;
  uniform float uPulse;
  uniform vec3 uPulseOrigin;
  attribute vec3 aColour;
  attribute float aAlpha;
  attribute float aDelay;
  attribute float aSway;
  attribute float aFlow;
  attribute vec3 aNormal;
  attribute float aEdge;
  attribute vec3 aSit;
  attribute vec3 aSitNormal;
  uniform float uStand;
  uniform float uPower;
  uniform float uFade;
  varying vec3 vColour;
  varying float vAlpha;

  /* Sitting to standing. The hind paws lift as they step back, rather than skating. */
  vec3 stance() {
    vec3 p = mix(aSit, position, uStand);
    float stepping = step(0.2, distance(aSit, position)) * smoothstep(0.3, 0.05, position.y);
    p.y += sin(3.14159265 * uStand) * 0.09 * stepping;
    return gait(p, position);
  }

  vec3 breeze(vec3 p) {
    float w = sin(uClock * 1.35 + p.x * 3.1 + p.y * 2.3) + 0.45 * sin(uClock * 2.4 + p.z * 5.0 + p.y * 4.0);
    return p + vec3(0.75 * w, 0.2 * sin(uClock * 1.9 + p.x * 6.0), 0.35 * w) * aSway;
  }

  // Rim and key light from the surface normal; filaments (zero normal) stay evenly lit.
  float shade(vec4 mv) {
    vec3 bent = mix(aSitNormal, aNormal, uStand);
    if (dot(bent, bent) < 0.25) return 1.0;
    vec3 n = normalize(normalMatrix * bent);
    float facing = dot(n, normalize(-mv.xyz));
    float rim = pow(1.0 - clamp(abs(facing), 0.0, 1.0), 2.0);
    float key = max(dot(n, normalize(vec3(-0.5, 0.65, 0.55))), 0.0);
    float network = 0.5 + 1.0 * rim + 0.4 * key;
    // Silhouette dust: faint face-on, gathering into a line of light where the form turns away.
    float silhouette = 0.11 + 0.12 * key + 2.5 * pow(rim, 1.35);
    return mix(network, silhouette, aEdge) * mix(0.25, 1.0, smoothstep(-0.35, 0.1, facing));
  }

  // The activation wave that runs out from the head, then the slow light flowing along strands.
  float light(vec3 world) {
    float d = distance(world, uPulseOrigin);
    float wave = exp(-pow((d - uPulse) * 4.5, 2.0)) * step(0.0, uPulse);
    float flow = pow(max(0.0, sin(aFlow * 1.6 - uClock * 1.7)), 24.0);
    return wave * 0.6 + flow * 0.6 * smoothstep(2.6, 3.4, uTime);
  }
`;

export const POINT_VERTEX = /* glsl */ `
  ${COMMON}
  uniform float uScale;
  uniform float uTravel;
  attribute vec3 aStart;
  attribute float aSize;
  attribute float aSquare;
  varying float vSquare;
  #ifdef DUO
  varying float vSpark;
  #endif

  void main() {
    float t = clamp((uTime - aDelay) / uTravel, 0.0, 1.0);
    float e = t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0;
    vec3 target = breeze(jawed(stance()));
    vec3 path = target - aStart;
    // A shared swirl, so the points arrive as one stream rather than as noise.
    vec3 swirl = cross(path, vec3(0.0, 1.0, 0.0)) * 0.34 * sin(3.14159265 * e) * (1.0 - e);
    vec3 p = mix(aStart, target, e) + swirl;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;

    float born = fract(sin(dot(aStart.xy, vec2(12.9898, 78.233))) * 43758.5453) * 0.45;
    float emerge = smoothstep(born, born + 0.3, uTime);
    float glint = light((modelMatrix * vec4(p, 1.0)).xyz);
    float twinkle = 0.92 + 0.08 * sin(uClock * 2.0 + aFlow * 7.0 + position.x * 40.0);
    float flight = sin(3.14159265 * e);

    vSquare = aSquare;
    vColour = mix(aColour, vec3(0.97, 0.99, 1.0), clamp(glint * 0.5, 0.0, 0.8));
    // Faint where they emerge, brightening as they gather.
    vAlpha = aAlpha * emerge * twinkle * mix(0.32, shade(mv), e) * (1.0 + glint) * mix(0.4, 1.0, uPower) + flight * 0.08 * emerge;
    float pixels = aSize * 2.6 * uScale / -mv.z;
    #ifdef INK
    vInk = inked(aColour, glint);
    vBuilt = built(gl_Position);
    #endif
    // Sprites under two pixels dim instead of shrinking, so small screens do not flare.
    vAlpha *= min(1.0, pixels / 2.0) * uFade;
    gl_PointSize = max(2.0, pixels) * (1.0 + glint * 0.35);
    #ifdef DUO
    // A faint sparkle where the dog crosses the window's edge: a few points by the edge brighten
    // and swell for a moment, each in its own time.
    vec2 at = (gl_Position.xy / gl_Position.w * 0.5 + 0.5) * uView.xy;
    float near = exp(-pow(windowEdge(at) / (uView.z * 3.5), 2.0));
    float spark = pow(max(0.0, sin(uClock * 2.3 + aFlow * 11.0 + position.y * 37.0)), 12.0);
    // Only the small, firm points: the large faint silhouette dust would bloom into a blot.
    vSpark = near * spark * step(0.0, uWindow.z - uWindow.x) * uPower * step(0.2, aAlpha) * smoothstep(9.0, 4.0, pixels);
    gl_PointSize *= 1.0 + vSpark * 0.6;
    #endif
  }
`;

export const POINT_FRAGMENT = /* glsl */ `
  varying vec3 vColour;
  varying float vAlpha;
  varying float vSquare;
  #ifdef INK
  varying vec3 vInk;
  varying float vBuilt;
  #endif
  #ifdef DUO
  ${DUO}
  varying float vSpark;
  #endif
  void main() {
    vec2 q = gl_PointCoord - 0.5;
    float r = length(q) * 2.0;
    float core = smoothstep(0.5, 0.12, r);
    float halo = pow(max(0.0, 1.0 - r), 2.2) * 0.34;
    float square = step(max(abs(q.x), abs(q.y)), 0.34);
    float a = mix(core + halo, square, vSquare) * vAlpha;
    #ifdef INK
    // Drawn: a crisp dot of ink, no halo. Built: the night light, added over its glass.
    // Faint coat dust thins out faster than the nodes, so the drawing stays crisp, not grey.
    float drawn = clamp(mix(smoothstep(0.5, 0.3, r), square, vSquare) * pow(clamp(vAlpha, 0.0, 1.5), 1.6) * 0.8, 0.0, 1.0) * (1.0 - vBuilt);
    float lit = a * vBuilt;
    #ifdef DUO
    // Inside the window the dog is built: the night point, added over its dark glass.
    float w = inWindow(gl_FragCoord.xy);
    float dye = a * w;
    drawn *= 1.0 - w;
    // The sparkle where the dog crosses the edge: a crisp saffron point, never a blot.
    float spark = vSpark * smoothstep(0.5, 0.3, r);
    vec3 pen = mix(vInk, vec3(0.88, 0.6, 0.18), clamp(spark * 1.5, 0.0, 1.0));
    drawn = clamp(max(drawn, spark * 0.85 * (1.0 - w)), 0.0, 1.0);
    vec3 hue = mix(vColour, vec3(0.93, 0.66, 0.24), clamp(spark * 1.5, 0.0, 1.0));
    dye = clamp(max(dye, spark * 0.85 * w), 0.0, 1.0);
    if (drawn + lit + dye < 0.004) discard;
    gl_FragColor = vec4(pen * drawn + vColour * lit + hue * dye, drawn);
    #else
    if (drawn + lit < 0.004) discard;
    gl_FragColor = vec4(vInk * drawn + vColour * lit, drawn);
    #endif
    #else
    if (a < 0.004) discard;
    gl_FragColor = vec4(vColour, a);
    #endif
  }
`;

export const LINE_VERTEX = /* glsl */ `
  ${COMMON}
  attribute float aTear;
  void main() {
    vec3 p = breeze(jawed(stance()));
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    // Strands light as their particles land.
    float drawn = smoothstep(aDelay + 0.72, aDelay + 1.08, uTime);
    float glint = light((modelMatrix * vec4(p, 1.0)).xyz);
    vColour = mix(aColour, vec3(0.97, 0.99, 1.0), clamp(glint * 0.5, 0.0, 0.8));
    vAlpha = aAlpha * drawn * shade(mv) * (1.0 + glint * 1.4) * mix(0.36, 1.0, uPower) * (1.0 - aTear * smoothstep(0.02, 0.2, uJaw)) * uFade;
    #ifdef INK
    vInk = inked(aColour, glint);
    vBuilt = built(gl_Position);
    #endif
    #ifdef DUO
    // A small dog is drawn with a lighter hand, so its network does not clot into a dark mass.
    vAlpha *= uDensity;
    #endif
  }
`;

export const LINE_FRAGMENT = /* glsl */ `
  varying vec3 vColour;
  varying float vAlpha;
  #ifdef INK
  varying vec3 vInk;
  varying float vBuilt;
  #endif
  #ifdef DUO
  ${DUO}
  #endif
  void main() {
    #ifdef INK
    float drawn = clamp(vAlpha * 0.5, 0.0, 1.0) * (1.0 - vBuilt);
    float lit = vAlpha * vBuilt;
    #ifdef DUO
    // Inside the window: the night strand, added over the dark glass.
    float w = inWindow(gl_FragCoord.xy);
    float dye = vAlpha * w;
    drawn *= 1.0 - w;
    if (drawn + lit + dye < 0.004) discard;
    gl_FragColor = vec4(vInk * drawn + vColour * lit + vColour * dye, drawn);
    #else
    if (drawn + lit < 0.004) discard;
    gl_FragColor = vec4(vInk * drawn + vColour * lit, drawn);
    #endif
    #else
    if (vAlpha < 0.004) discard;
    gl_FragColor = vec4(vColour, vAlpha);
    #endif
  }
`;

/* The dim glass volume inside the light: it hides the far side and gives the form its depth. */
export const VOLUME_VERTEX = /* glsl */ `
  ${JAW}
  ${GAIT}
  ${INK}
  attribute vec3 aSit;
  attribute vec3 aSitNormal;
  uniform float uStand;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    // Pulled in a little so the surface particles sit clear of it.
    vec3 bent = normalize(mix(aSitNormal, normal, uStand));
    vec4 mv = modelViewMatrix * vec4(gait(jawed(mix(aSit, position, uStand)), position) - bent * 0.01, 1.0);
    vNormal = normalize(normalMatrix * bent);
    vView = -mv.xyz;
    gl_Position = projectionMatrix * mv;
    #ifdef INK
    vBuilt = built(gl_Position);
    #endif
  }
`;

export const VOLUME_FRAGMENT = /* glsl */ `
  uniform float uAppear;
  uniform float uPower;
  uniform float uFade;
  varying vec3 vNormal;
  varying vec3 vView;
  #ifdef INK
  varying float vBuilt;
  #endif
  #ifdef DUO
  ${DUO}
  #endif
  void main() {
    vec3 n = normalize(vNormal) * (gl_FrontFacing ? 1.0 : -1.0);
    float facing = clamp(dot(n, normalize(vView)), 0.0, 1.0);
    float rim = pow(1.0 - facing, 3.4);
    float key = max(dot(n, normalize(vec3(-0.5, 0.65, 0.55))), 0.0);
    vec3 colour = vec3(0.018, 0.052, 0.08)
      + vec3(0.012, 0.05, 0.075) * key * key
      + vec3(0.07, 0.36, 0.5) * rim * 0.62;
    float a = uAppear * uFade;
    #ifdef INK
    // Drawn, the glass is only a wash of ink gathering at the edge; built, it is the night glass.
    float wash = 0.1 * rim * a;
    vec4 drawnGlass = vec4(vec3(0.043, 0.102, 0.149) * wash, wash);
    #ifdef DUO
    // Inside the window the glass is the night glass, near opaque so it reads on white paper.
    drawnGlass = mix(drawnGlass, vec4(colour * a * mix(0.55, 1.0, uPower), 0.94 * a), inWindow(gl_FragCoord.xy));
    #endif
    gl_FragColor = mix(drawnGlass, vec4(colour * a * mix(0.55, 1.0, uPower), 0.86 * a), vBuilt);
    #else
    gl_FragColor = vec4(colour * a * mix(0.55, 1.0, uPower), 0.86 * a);
    #endif
  }
`;

/* The open mouth is moved on the CPU, so its light needs no more than position, colour and size. */
export const MOUTH_POINT_VERTEX = /* glsl */ `
  ${INK}
  uniform float uScale;
  attribute vec3 aColour;
  attribute float aAlpha;
  attribute float aSize;
  varying vec3 vColour;
  varying float vAlpha;
  varying float vSquare;
  #ifdef DUO
  varying float vSpark;
  #endif
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    float pixels = aSize * 2.6 * uScale / -mv.z;
    vColour = aColour;
    vAlpha = aAlpha * min(1.0, pixels / 2.0);
    vSquare = 0.0;
    gl_PointSize = max(2.0, pixels);
    #ifdef INK
    vInk = inked(aColour, 0.0);
    vBuilt = built(gl_Position);
    #endif
    #ifdef DUO
    vSpark = 0.0;
    #endif
  }
`;

export const MOUTH_LINE_VERTEX = /* glsl */ `
  ${INK}
  attribute vec3 aColour;
  attribute float aAlpha;
  varying vec3 vColour;
  varying float vAlpha;
  void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vColour = aColour;
    vAlpha = aAlpha;
    #ifdef INK
    vInk = inked(aColour, 0.0);
    vBuilt = built(gl_Position);
    #endif

  }
`;
