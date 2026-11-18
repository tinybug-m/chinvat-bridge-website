/*
 * Where a visit started and the page read just before the contact form, so an enquiry can say
 * which page prompted it (seo/overnight-2026-11-18/14-conversion-optimisation.md). Held in this
 * module's memory for the life of the tab: nothing is written to cookies or storage, and nothing
 * leaves the browser unless the visitor sends a message. The referrer is kept as a host name only.
 */

export interface Journey {
  /** First page of the visit, with any utm_ parameters it arrived with. */
  entry: string;
  /** Host of the site that sent the visitor, or "" when direct or internal. */
  referrer: string;
  /** The page read immediately before the current one ("" on the first page). */
  previous: string;
}

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign"] as const;

let journey: Journey = { entry: "", referrer: "", previous: "" };
let current = "";

/** Records a page view; called on every client-side route change. */
export function recordPage(pathname: string) {
  if (!journey.entry) {
    const params = new URLSearchParams(window.location.search);
    const utm = new URLSearchParams();
    for (const key of UTM_KEYS) {
      const value = params.get(key);
      if (value) utm.set(key, value);
    }
    let referrer = "";
    try {
      const host = document.referrer ? new URL(document.referrer).hostname : "";
      referrer = host === window.location.hostname ? "" : host;
    } catch {
      referrer = "";
    }
    const query = utm.toString();
    journey = { entry: query ? `${pathname}?${query}` : pathname, referrer, previous: "" };
  }
  if (pathname !== current) {
    journey = { ...journey, previous: current };
    current = pathname;
  }
}

export const readJourney = (): Journey => journey;
