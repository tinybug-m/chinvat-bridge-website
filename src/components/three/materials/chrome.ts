import { LinearFilter, LinearMipmapLinearFilter, SRGBColorSpace, type Texture, TextureLoader } from "three";
import { MARK_TEXTURE } from "@/components/brand/mark-texture";
import { MARK_AXIS_X } from "@/components/brand/mark-geometry";
import { MARK_CENTRE_PX, UNITS_PER_PX } from "../geometry/mark-outline";

/*
 * The real liquid-chrome pixels of docs/brand/newLogo.jpg (right half of the
 * brand mark), loaded as a texture for the built glass. The crop shares the
 * mark's source-pixel space 1:1, so world xy maps to texture uv with one
 * scale and one offset; the left half samples it mirrored about the axis.
 *
 * Loading is lazy and optional: the caller keeps the procedural film until
 * (and unless) the texture arrives.
 */

export interface ChromeTextureUv {
  /** u = abs(worldX) * uScale + uOffset. */
  uScale: number;
  uOffset: number;
  /** v = worldY * vScale + vOffset. */
  vScale: number;
  vOffset: number;
}

/** World-to-uv mapping for the crop placed at MARK_TEXTURE.x/y (full and small share it). */
export function chromeTextureUv(): ChromeTextureUv {
  const { x, y, width, height } = MARK_TEXTURE;
  return {
    uScale: 1 / (UNITS_PER_PX * width),
    uOffset: (MARK_AXIS_X - x) / width,
    vScale: 1 / (UNITS_PER_PX * height),
    vOffset: 1 - (MARK_CENTRE_PX.y - y) / height,
  };
}

export interface ChromeTextureRequest {
  promise: Promise<Texture | null>;
  /** Cancels a pending load and frees the texture if it already arrived. */
  dispose(): void;
}

/** Loads the chrome crop (the small file on the low tier). Resolves null on failure. */
export function loadChromeTexture(tier: "high" | "low", maxAnisotropy = 1): ChromeTextureRequest {
  let disposed = false;
  let texture: Texture | null = null;
  const promise = new Promise<Texture | null>((resolve) => {
    new TextureLoader().load(
      tier === "high" ? MARK_TEXTURE.src : MARK_TEXTURE.smSrc,
      (loaded) => {
        if (disposed) {
          loaded.dispose();
          resolve(null);
          return;
        }
        loaded.colorSpace = SRGBColorSpace;
        loaded.minFilter = LinearMipmapLinearFilter;
        loaded.magFilter = LinearFilter;
        loaded.anisotropy = Math.min(4, maxAnisotropy);
        texture = loaded;
        resolve(loaded);
      },
      undefined,
      () => resolve(null),
    );
  });
  return {
    promise,
    dispose() {
      disposed = true;
      texture?.dispose();
      texture = null;
    },
  };
}
