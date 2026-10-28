# three/ — WebGL stages

Shared runtime for every 3D scene on the site (hero seam, Bridge, Method).
three.js is **never** in the initial bundle: only `core/ThreeStage.tsx`,
`core/controller.ts`, `core/quality.ts`, `core/budget.ts` and type-only
imports ship with the page; `core/runtime.ts` and the scene module are
`import()`ed when the stage triggers.

```
core/        ThreeStage (React), controller (lifecycle), runtime (renderer + loop),
             quality tiers, context budget, motion helpers, dispose, debug probe, switches
materials/   seam (drawn↔built blend), pencil (ink lines), environment (PMREM studio), palette
geometry/    mark (extruded brand mark), mark-outline (2D rings, pure data), shadow (baked)
scenes/seam/ the hero exhibit (index.ts) + config.ts (frame, anchors; pure data, server-safe)
```

## Using a stage

```tsx
"use client";
const load = () => import("@/components/three/scenes/my-scene"); // module-level constant

<ThreeStage id="bridge" load={load} handleRef={handle} className="relative aspect-[4/3]"
  mountMargin="25% 0px" releaseMargin="200% 0px" reducedMotion="fallback">
  {/* server-rendered layers: poster (next/image), line drawing… */}
</ThreeStage>
```

- The root carries `data-stage="<id>"` and `data-stage-state`:
  `idle → loading → live`, `suspended`/`resuming` (context released or being
  re-created), `fallback` (no WebGL 2, reduced motion, error). Style children
  per state with `group-data-[stage-state=live]/stage:…` (see `home/hero/HeroObject.tsx`).
- The canvas is appended into an `aria-hidden` layer above the children and
  fades in (400 ms) when live. Size the root (aspect-ratio) so nothing shifts.
- `handleRef` → `StageHandle`: `set(key, value)` feeds scene inputs (kept until
  the scene exists and re-applied on resume), `get(key)`, `state`.
- `onOutput(key, value)` receives `context.output()` from the scene.
- `reducedMotion`: `"fallback"` (default, poster only) or `"static"` (one frame, no loop).

## Lifecycle (controller.ts)

| When | What |
|---|---|
| page `load` + `requestIdleCallback`, and root within `mountMargin` (default `50% 0px`) | import runtime + scene, create the context, compile async, first frame |
| root intersects the viewport and the tab is visible | rAF loop runs; otherwise it stops |
| scene `update()` returns false and nothing invalidated | loop sleeps (render on demand) |
| root outside `releaseMargin` (default `150% 0px`) | full dispose, context lost → `suspended`, poster shows |
| a 3rd stage wants a context (`MAX_LIVE_CONTEXTS = 2`) | the live stage farthest from the viewport centre is suspended; a waiting stage retries when a slot frees |
| `webglcontextlost` | treated as a suspension, re-created on return |

Sizing: `ResizeObserver` on the root; DPR cap 2 desktop, 1.5 coarse pointers,
1 on the low tier (3 in poster capture).

## Quality (quality.ts, decided once per page view, no three needed)

- `none`: no WebGL 2 → `fallback`.
- `low`: `failIfMajorPerformanceCaveat` probe fails, software renderer
  (SwiftShader/llvmpipe…), Save-Data, ≤ 2 cores, or a coarse-pointer small
  screen that also reports ≤ 4 cores and ≤ 4 GB. Four cores alone is not low.
- `high`: everything else.
- Override on the client: `?quality=high|low|none` (all builds).

## Writing a scene

```ts
import type { SceneModule } from "@/components/three/core/types";
const scene: SceneModule = {
  createScene(ctx) {            // ctx: renderer, canvas, container, quality, capture,
    …                           //      firstMount, size, invalidate(), input(k, d),
    return {                    //      output(k, v), environment() (shared PMREM)
      scene, camera,
      resize(size) {},          // CSS px + capped dpr; set camera aspect here
      update(dt, elapsed) { return stillMoving; },   // false lets the loop sleep
      onInput(key, value) {},
      dispose() {},             // only what traversal cannot find; geometries,
    };                          // materials and their textures are freed for you
  },
};
export default scene;
```

- Play intros only when `ctx.firstMount && !ctx.capture`; damp inputs with
  `damp()` from `core/motion.ts` (`EASE.*` mirror the CSS easing tokens).
- `ctx.capture` (dev `?poster=1`): render the rest pose once, no intro or
  input; the drawing buffer is preserved for the poster script.
- Materials: `createSeamMaterial({ envMap: ctx.environment(), tier, halfDepth })`
  returns `{ material, uniforms }`; animate `uniforms.uSeamX` (world x; left is
  drawn maquette, right is built thin film), `uPhase` (film shift). `createMaquetteMaterial`
  / `createIridescentMaterial` are the one-sided versions; `createPencilMaterial`
  gives ink lines that vanish right of `uSeamX`.
- Budget per scene: ≤ ~20k triangles, 2–4 draw calls, no shadow maps or
  post-processing; bake shadows (`geometry/shadow.ts` shows the canvas-blur approach).

## QA hooks (development only)

- `window.__three[id]`: `state`, `frames`, `running`, `visible`, `tier`, `dpr`,
  `triangles`, `calls`, `geometries`, `textures`, `contexts`.
- The first frame logs `[three:id] tier, dpr, triangles, draw calls` with `console.info`.
- Poster: `node scripts/poster/seam.mjs` (dev server running) writes
  `public/hero/seam-poster.png` from `/?poster=1`; copy it for other scenes.
