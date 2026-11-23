// Tag for tests whose checks don't depend on the viewport (content, structure, links): the tablet
// and mobile projects skip them in playwright.config.ts, so they run once, on desktop.
export const ONCE = { tag: "@once" };
