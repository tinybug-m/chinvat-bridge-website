import localFont from "next/font/local";

// Preloaded on the routes whose layout applies them: the (site) and (pages) groups, plus the root 404 and error boundary.

// Archivo carries the brand: one variable file covers every weight and width,
// so display type can run expanded while body text stays at normal width.
export const archivo = localFont({
  src: "./fonts/Archivo-latin-wdth-wght.woff2",
  variable: "--font-brand",
  weight: "100 900",
  style: "normal",
  display: "swap",
  // The stand-in is hand-tuned per stretch and weight in base.css.
  adjustFontFallback: false,
  declarations: [{ prop: "font-stretch", value: "62% 125%" }],
});

// Martian Mono labels technical detail: section markers, indices, captions.
export const martianMono = localFont({
  src: "./fonts/MartianMono-latin-wght.woff2",
  variable: "--font-brand-mono",
  weight: "100 800",
  style: "normal",
  display: "swap",
});
