/*
 * Which material the glass logo is shown in: "chrome" (the photographed liquid
 * chrome, default) or "classic" (the cerulean / saffron gradient).
 *
 * The choice lives on <html data-logo-material>, so server-rendered marks can
 * carry both layers and CSS (logo-material.css) picks the visible one: no
 * re-render, no hydration mismatch. LOGO_MATERIAL_RUNTIME restores the saved
 * choice before first paint. The hero 3D scene follows through the same
 * attribute (subscribeLogoMaterial).
 */

export type LogoMaterial = "chrome" | "classic";

export const LOGO_MATERIAL_ATTRIBUTE = "data-logo-material";
export const LOGO_MATERIAL_STORAGE_KEY = "chinvat:logo-material";
export const DEFAULT_LOGO_MATERIAL: LogoMaterial = "chrome";

/** Inline script for <head>: applies the saved choice before first paint. */
export const LOGO_MATERIAL_RUNTIME = `(function(){try{var v=localStorage.getItem(${JSON.stringify(LOGO_MATERIAL_STORAGE_KEY)});if(v==="classic"||v==="chrome")document.documentElement.setAttribute(${JSON.stringify(LOGO_MATERIAL_ATTRIBUTE)},v);}catch(e){}})();`;

export function readLogoMaterial(): LogoMaterial {
  return document.documentElement.getAttribute(LOGO_MATERIAL_ATTRIBUTE) === "classic" ? "classic" : "chrome";
}

export function setLogoMaterial(material: LogoMaterial) {
  document.documentElement.setAttribute(LOGO_MATERIAL_ATTRIBUTE, material);
  try {
    window.localStorage.setItem(LOGO_MATERIAL_STORAGE_KEY, material);
  } catch {
    // Private mode or blocked storage: the choice just lasts for this page view.
  }
}

/** Calls back whenever the attribute changes, from any source. Returns the unsubscribe. */
export function subscribeLogoMaterial(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: [LOGO_MATERIAL_ATTRIBUTE] });
  return () => observer.disconnect();
}
