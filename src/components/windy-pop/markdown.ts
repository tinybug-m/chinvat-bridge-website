// A small, safe subset of Markdown for the assistant's replies: paragraphs, lists, bold, italics,
// inline code and links. It returns a plain tree that React renders as elements, so raw model text
// is never injected as HTML, and only http(s), mailto and site-relative links survive.

export type Inline =
  | { t: "text"; v: string }
  | { t: "strong" | "em"; c: Inline[] }
  | { t: "code"; v: string }
  | { t: "link"; href: string; c: Inline[] };

export type Block = { t: "p"; c: Inline[] } | { t: "ul" | "ol"; items: Inline[][] };

/** The URL if it is safe to link to, otherwise null. */
export function safeHref(raw: string): string | null {
  const url = raw.trim();
  if (/^\/(?![/\\])[\w\-./%~@?=&#+]*$/.test(url)) return url;
  try {
    const parsed = new URL(url);
    return ["https:", "http:", "mailto:"].includes(parsed.protocol) ? parsed.href : null;
  } catch {
    return null;
  }
}

const PATTERN = new RegExp(
  [
    String.raw`\*\*(?=\S)(.+?)(?<=\S)\*\*`, // 1 bold
    String.raw`(?<!\w)__(?=\S)(.+?)(?<=\S)__(?!\w)`, // 2 bold
    String.raw`\*(?=[^\s*])(.+?)(?<=[^\s*])\*`, // 3 italic
    String.raw`(?<![\w])_(?=[^\s_])(.+?)(?<=[^\s_])_(?![\w])`, // 4 italic
    String.raw`` + "`([^`\\n]+)`", // 5 code
    String.raw`\[([^\]\n]+)\]\(([^)\s]+)\)`, // 6 text, 7 url
    String.raw`(https?:\/\/[^\s<>]*[^\s<>.,;:!?)\]'"])`, // 8 bare URL
    String.raw`((?<=^|[\s(])\/[a-z][\w\-/]*[a-z0-9])`, // 9 site path such as /pricing
  ].join("|"),
  "g",
);

export function parseInline(src: string): Inline[] {
  const out: Inline[] = [];
  let last = 0;
  const text = (v: string) => v && out.push({ t: "text", v });
  for (const m of src.matchAll(PATTERN)) {
    text(src.slice(last, m.index));
    last = m.index + m[0].length;
    const bold = m[1] ?? m[2];
    const italic = m[3] ?? m[4];
    if (bold) out.push({ t: "strong", c: parseInline(bold) });
    else if (italic) out.push({ t: "em", c: parseInline(italic) });
    else if (m[5]) out.push({ t: "code", v: m[5] });
    else if (m[6]) {
      const href = safeHref(m[7]);
      if (href) out.push({ t: "link", href, c: parseInline(m[6]) });
      else text(m[6]);
    } else {
      const raw = m[8] ?? m[9];
      const href = raw && safeHref(raw);
      if (href) out.push({ t: "link", href, c: [{ t: "text", v: raw }] });
      else text(m[0]);
    }
  }
  text(src.slice(last));
  return out;
}

const BULLET = /^\s*(?:[-*•])\s+(.*)$/;
const NUMBER = /^\s*\d{1,2}[.)]\s+(.*)$/;

export function parseMarkdown(src: string): Block[] {
  const blocks: Block[] = [];
  let para: string[] = [];
  let list: { t: "ul" | "ol"; items: string[] } | null = null;
  const flushPara = () => {
    if (para.length) blocks.push({ t: "p", c: parseInline(para.join("\n")) });
    para = [];
  };
  const flushList = () => {
    if (list) blocks.push({ t: list.t, items: list.items.map(parseInline) });
    list = null;
  };
  for (const line of src.replace(/\r\n?/g, "\n").split("\n")) {
    const bullet = BULLET.exec(line);
    const number = bullet ? null : NUMBER.exec(line);
    const item = bullet ?? number;
    if (item) {
      flushPara();
      const kind = bullet ? "ul" : "ol";
      if (list && list.t !== kind) flushList();
      list ??= { t: kind, items: [] };
      list.items.push(item[1]);
    } else if (!line.trim()) {
      flushPara();
      flushList();
    } else if (list && /^\s{2,}\S/.test(line)) {
      list.items[list.items.length - 1] += ` ${line.trim()}`;
    } else {
      flushList();
      // Headings are not part of the chat voice: keep the words, drop the hashes.
      para.push(line.replace(/^\s*#{1,6}\s+/, ""));
    }
  }
  flushPara();
  flushList();
  return blocks;
}
