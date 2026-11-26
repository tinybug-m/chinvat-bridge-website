import type { Mood } from "./chat-schema";

// Explicit local mock, used only when WINDY_POP_MOCK=1. Wording sticks to what the site copy says.
export const MOCK_FIRST_LINE = "(Local mock reply, not a live model.)";

const REPLIES: Record<string, string> = {
  automation:
    "Workflow automation here means connecting your tools and reducing repetitive tasks, so your team spends more time on higher-value work. A good start is the one task that costs you the most time each week. Which task is that?",
  ai:
    "Chinvat Bridge helps businesses find practical AI opportunities and integrate AI where it creates value. AI makes mistakes, so anything involving money or customer trust should have a person checking it. What task do you have in mind?",
  software:
    "Chinvat Bridge builds websites, web applications, internal tools and client portals around the way your business works. If an off-the-shelf tool is enough, that is worth knowing early. What would you want the software to do?",
  seo:
    "On SEO, the focus is the technical foundations: site structure, structured data and performance, so search engines and customers can understand your business. Is there a particular site you have in mind?",
  price:
    "Cost depends on the scope of the project, so I can't give a figure. The pricing page explains the options, and the team can talk it through with you.",
  default:
    "Chinvat Bridge is a UK-based consultancy working with businesses worldwide on AI, automation, custom software and SEO. Tell me which task is costing you the most time and we can start there.",
};

export function pickMockReply(text: string): string {
  const t = text.toLowerCase();
  if (/(price|pricing|cost|quote|how much)/.test(t)) return REPLIES.price;
  if (/(automat|workflow|by hand|manual|repeat)/.test(t)) return REPLIES.automation;
  if (/(\bseo\b|search|google rank)/.test(t)) return REPLIES.seo;
  if (/(software|app|website|portal|build)/.test(t)) return REPLIES.software;
  if (/(\bai\b|llm|chatbot|artificial)/.test(t)) return REPLIES.ai;
  return REPLIES.default;
}

/** The mood a mock reply carries, as the live model would send it in its tag. */
export function pickMockMood(text: string): Mood {
  const t = text.toLowerCase();
  if (/(sorry|wrong|broken|doesn'?t work|not working|error|problem|frustrat)/.test(t)) return "sorry";
  if (/(thank|great|brilliant|love|amazing|wow|perfect|fantastic)/.test(t)) return "excited";
  if (/(hello|hi\b|hey|good (morning|afternoon|evening))/.test(t)) return "happy";
  if (/(price|pricing|cost|quote|how much)/.test(t)) return "neutral";
  return /(\?|how|what|why|can you|could you|which)/.test(t) ? "curious" : "happy";
}

/** Streams like the live providers do: the mood tag first (split across chunks on purpose), then the text. */
export async function* mockStream(lastUserText: string, signal?: AbortSignal, delayMs = 25): AsyncGenerator<string, void, void> {
  const tag = `[mood:${pickMockMood(lastUserText)}]`;
  yield tag.slice(0, 4);
  await new Promise((r) => setTimeout(r, delayMs));
  yield tag.slice(4);
  const full = `${MOCK_FIRST_LINE}\n\n${pickMockReply(lastUserText)}`;
  const words = full.split(/(?<= )/);
  for (let i = 0; i < words.length; i += 2) {
    if (signal?.aborted) return;
    yield words.slice(i, i + 2).join("");
    await new Promise((r) => setTimeout(r, delayMs));
  }
}
