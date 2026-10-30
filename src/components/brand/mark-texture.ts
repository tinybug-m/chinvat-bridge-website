/**
 * Real chrome texture cut from docs/brand/newLogo.jpg (right half of the brand
 * mark: liquid chrome with oil-slick thin-film iridescence).
 *
 * The photo (1254x1254) shares the mark's source-pixel space 1:1 (mark-geometry.ts
 * was traced from it). The crop starts at photo (625, 324), so inside the Mark
 * SVG (viewBox "318 325 615 598") place the image at x=625 y=324 in user units,
 * width=309 height=600 (1 user unit = 1 photo pixel), and clip it with
 * MARK_RIGHT_PATH. Verified: path edge sits on the chrome rim within ~1px, no dark
 * halo inside the path (rim is the brightest ring), the photo's outer glow extends
 * ~2-3px beyond the path. No inset needed.
 *
 * The black photo background is baked into the file (opaque WebP); the clip hides it.
 * The small variant is the same crop scaled to 128px wide (same placement box).
 */
export const MARK_TEXTURE = {
  src: "/brand/chrome-texture.webp",
  smSrc: "/brand/chrome-texture-sm.webp",
  x: 625,
  y: 324,
  width: 309,
  height: 600,
  naturalWidth: 309,
  naturalHeight: 600,
  smNaturalWidth: 128,
  smNaturalHeight: 249,
} as const;
