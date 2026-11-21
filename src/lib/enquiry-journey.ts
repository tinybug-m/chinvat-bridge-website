/*
 * Turns the journey a contact message carries (components/site/journey.ts) into lines for the
 * enquiry email. Everything arrives from the browser, so only plain site paths and bare host
 * names survive; anything else is dropped rather than repaired.
 */

export interface JourneyInput {
  entry?: unknown;
  referrer?: unknown;
  previous?: unknown;
}

const oneLine = (value: unknown, max: number) => (typeof value === "string" ? value.replace(/[\r\n]+/g, " ").trim().slice(0, max) : "");

/** A path on this site; "//host" is another site (protocol-relative), so it is refused. */
const PATH = /^\/(?!\/)[\w\-./%~@]*$/;
/** URLSearchParams output: percent-encoded, with "+" for spaces; "*" is left unencoded. */
const QUERY = /^[\w\-.=&%+*]*$/;

/**
 * A site path, optionally with a query string of plain characters. An unusable query is dropped
 * on its own, so a campaign tag with odd characters never costs the landing page itself.
 */
export const sitePath = (value: unknown) => {
  const [path, query, ...rest] = oneLine(value, 300).split("?");
  if (!PATH.test(path ?? "")) return "";
  return query && !rest.length && QUERY.test(query) ? `${path}?${query}` : path;
};

/** A bare host name, such as www.google.com. */
export const hostName = (value: unknown) => {
  const host = oneLine(value, 253).toLowerCase();
  return /^[a-z0-9.-]+$/.test(host) ? host : "";
};

/** Which pages led to the enquiry, so the team can see what prompted it. Empty when unknown. */
export function journeyLines(journey: JourneyInput | undefined): string[] {
  const entry = sitePath(journey?.entry);
  const referrer = hostName(journey?.referrer);
  const previous = sitePath(journey?.previous);
  return [
    ...(entry ? [`First page: ${entry}${referrer ? ` (from ${referrer})` : " (direct or unknown)"}`] : []),
    ...(previous && previous !== entry ? [`Page before contact: ${previous}`] : []),
  ];
}
