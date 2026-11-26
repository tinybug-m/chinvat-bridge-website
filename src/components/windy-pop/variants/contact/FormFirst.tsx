"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { WindyMark } from "@/components/windy-pop/chat-icons";
import { useWindyChat } from "@/components/windy-pop/useWindyChat";
import { cn } from "@/lib/utils";
import { DuoChat } from "../duo/DuoChat";
import { EnquiryForm } from "./EnquiryForm";
import { ContactShell, EmailLine, PerchedCard, type ContactProps } from "./parts";

/*
 * "Form first": the form is open on arrival, with what happens next and the address beside it. Windy
 * Pup is one click away: from the switch at the top of the card, from the dog, or from the dog's line.
 * Both stay in the card, so switching loses nothing and the page never moves.
 */
const NEXT = [
  ["You send a short note", "A few lines are enough. No brief or budget needed."],
  ["A person reads it", "Your message goes to the team, not to a bot."],
  ["We reply by email", "To the address you give, with an answer or our questions."],
];

const TABS = [
  { key: "form", title: "Write to us" },
  { key: "chat", title: "Ask Windy Pup" },
] as const;
type Tab = (typeof TABS)[number]["key"];

export function FormFirst({ heading, lede, email, noscriptLead, solo, chat = true }: ContactProps) {
  const { messages } = useWindyChat();
  // Someone who has already been talking to the dog arrives on the conversation.
  const [chosen, setChosen] = useState<Tab | null>(null);
  const tab: Tab = !chat ? "form" : (chosen ?? (messages.some((m) => m.role === "user") ? "chat" : "form"));
  // The chat is built on first use, then kept, so a half-typed line survives switching.
  const [opened, setOpened] = useState(false);
  if (tab === "chat" && !opened) setOpened(true);
  const buttons = useRef<Partial<Record<Tab, HTMLButtonElement | null>>>({});
  const chatPanel = useRef<HTMLDivElement>(null);

  /** From the dog: open the chat, bring the card into view and, with a mouse, put the caret in it. */
  function askTheDog() {
    setChosen("chat");
    // Two frames: the panel has to be built and no longer inert.
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        chatPanel.current?.scrollIntoView({ block: "nearest", behavior: reduced ? "auto" : "smooth" });
        if (window.matchMedia("(pointer: fine)").matches) chatPanel.current?.querySelector<HTMLTextAreaElement>("textarea")?.focus({ preventScroll: true });
        else buttons.current.chat?.focus({ preventScroll: true });
      }),
    );
  }

  function onKeyDown(event: KeyboardEvent) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const next: Tab = event.key === "Home" ? "form" : event.key === "End" ? "chat" : tab === "form" ? "chat" : "form";
    setChosen(next);
    buttons.current[next]?.focus();
  }

  return (
    <ContactShell email={email} noscriptLead={noscriptLead} solo={solo}>
      <div className="grid gap-x-6 gap-y-12 lg:grid-cols-12 lg:grid-rows-[auto_1fr]">
        <div className="lg:col-span-5">
          <h2 id="contact-title" className="max-w-[14ch] text-balance font-display text-title font-medium">
            {heading}
          </h2>
          <p className="mt-6 max-w-measure text-pretty text-lede text-ink-soft">{lede}</p>
        </div>

        <div className="lg:col-span-6 lg:col-start-7 lg:row-span-2 lg:row-start-1">
          <PerchedCard onDog={chat ? askTheDog : undefined} invite={chat && tab === "form" ? { text: "Or just ask me", onClick: askTheDog } : undefined}>
            {chat ? (
              <div role="tablist" aria-label="How to reach us" className="grid grid-cols-[2fr_3fr] gap-1 border-b border-line p-1.5 sm:grid-cols-2">
                {TABS.map((t) => (
                  <button
                    key={t.key}
                    ref={(el) => {
                      buttons.current[t.key] = el;
                    }}
                    id={`contact-tab-${t.key}`}
                    type="button"
                    role="tab"
                    aria-selected={tab === t.key}
                    aria-controls={`contact-panel-${t.key}`}
                    tabIndex={tab === t.key ? 0 : -1}
                    onClick={() => setChosen(t.key)}
                    onKeyDown={onKeyDown}
                    className="flex min-h-12 items-center justify-center gap-1.5 rounded-lg px-1 text-small font-medium whitespace-nowrap text-ink sm:gap-2 sm:px-2 sm:text-body max-[22.5rem]:[&_svg]:hidden transition-colors hover:bg-haze aria-selected:bg-ink aria-selected:text-paper"
                  >
                    {t.key === "chat" ? <WindyMark size={26} tone={tab === "chat" ? "light" : "ink"} /> : null}
                    {t.title}
                    {t.key === "chat" ? <span className="rounded-full border border-current px-1.5 py-0.5 text-[0.6875rem] leading-none opacity-70">AI</span> : null}
                  </button>
                ))}
              </div>
            ) : null}
            {/* One cell for both panels: the form sets the height and the chat scrolls inside it. The other panel is
                inert and clear, not `invisible`: under reduced motion inherited visibility arrives a frame per level. */}
            <div className="grid">
              <div id="contact-panel-form" role={chat ? "tabpanel" : undefined} aria-labelledby={chat ? "contact-tab-form" : undefined} inert={tab !== "form" || undefined} className={cn("col-start-1 row-start-1 min-w-0 p-5 sm:p-8", tab !== "form" && "opacity-0")}>
                <EnquiryForm placeholder="For example: we retype orders into three systems every day." />
              </div>
              {chat ? (
                <div
                  ref={chatPanel}
                  id="contact-panel-chat"
                  role="tabpanel"
                  aria-labelledby="contact-tab-chat"
                  inert={tab !== "chat" || undefined}
                  className={cn("relative col-start-1 row-start-1 min-w-0 scroll-mt-24", tab !== "chat" && "opacity-0")}
                >
                  {opened ? (
                    <div className="absolute inset-0 flex flex-col p-4 [--wp-chat-height:100%] sm:px-8 sm:py-5">
                      <DuoChat place="contact" />
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </PerchedCard>
        </div>

        <div className="lg:col-span-5">
          {/* An ordered list because the order is the information; drawn as a line, not numbered. */}
          <ol aria-label="What happens next" className="max-w-measure">
            {NEXT.map(([title, text]) => (
              <li key={title} className="group relative pb-6 pl-6 last:pb-0">
                {/* The line runs from this dot to the next. */}
                <span aria-hidden="true" className="absolute top-[15px] -bottom-1.5 left-0 w-px bg-line-strong group-last:hidden" />
                <span aria-hidden="true" className="absolute top-1.5 -left-1 size-[9px] rounded-full border border-ink bg-haze" />
                <p className="text-body font-medium text-ink">{title}</p>
                <p className="text-small text-ink-soft">{text}</p>
              </li>
            ))}
          </ol>
          <div className="mt-10 border-t border-line pt-6">
            <p className="text-small text-ink-muted">Prefer your own email?</p>
            <EmailLine email={email} className="mt-1" />
          </div>
        </div>
      </div>
    </ContactShell>
  );
}
