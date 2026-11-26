"use client";

import { Fragment, useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { ArrowUpIcon, CheckIcon, ChevronDownIcon, CloseIcon, PlaneIcon, RestartIcon, StopIcon, Ticks, WarnIcon, WindyMark } from "@/components/windy-pop/chat-icons";
import { Handoff } from "@/components/windy-pop/Handoff";
import { Markdown } from "@/components/windy-pop/Markdown";
import { parseMarkdown } from "@/components/windy-pop/markdown";
import { useWindyChat, type UiMessage } from "@/components/windy-pop/useWindyChat";
import { CONTACT_EMAIL } from "@/lib/constants";
import { MAX_MESSAGE_CHARS } from "@/lib/windy-pop/chat-schema";
import styles from "./minimal.module.css";

/*
 * The Windy Pup chat: Telegram-like bubbles with no background. No card, no panel, no wallpaper; the
 * conversation sits straight on the page.
 */

const SUGGESTIONS = [
  { label: "What does AI integration involve?", need: "AI & Automation" },
  { label: "Automating repetitive work", need: "Workflows" },
  { label: "Custom software or a client portal", need: "Software & Web" },
  { label: "Technical SEO", need: "SEO & Growth" },
  { label: "How pricing works", need: "" },
];

const GREETING = ["Need anything?", "I’m an AI assistant for Chinvat Bridge. I can answer questions about what the team does, or pass your details to them."];

/** An example exchange so a design can be judged without talking to the model. Never sent anywhere. */
const clock = (at: number) => new Date(at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

type Row = { key: string; role: "user" | "assistant"; content: string; at: number; message?: UiMessage };

/** `floating`: the chat floats over the page, so it takes a plain sheet and stays above a phone's keyboard. */
export function MinimalChat({ floating = false, onClose }: { floating?: boolean; onClose?: () => void }) {
  const chat = useWindyChat();
  const { messages, status, error, mode, activity, send, stop, reset, retry, wake, handoff, openHandoff, closeHandoff, markSent, reportComposer, reportKeystroke } = chat;
  const id = useId();
  const [draft, setDraft] = useState("");
  const [away, setAway] = useState(false);
  const [unread, setUnread] = useState(0);
  const seen = useRef(0);
  const log = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const stick = useRef(true);
  const busy = status === "thinking" || status === "responding";
  const hasUser = messages.some((m) => m.role === "user");
  const sent = handoff.sent;

  useEffect(wake, [wake]);
  useEffect(() => () => reportComposer(id, null), [id, reportComposer]);

  const toBottom = useCallback((smooth = false) => {
    const el = log.current;
    if (!el) return;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ top: el.scrollHeight, behavior: smooth && !calm ? "smooth" : "auto" });
  }, []);

  useLayoutEffect(() => {
    const el = input.current;
    if (!el) return;
    el.style.height = "auto";
    const full = el.scrollHeight + el.offsetHeight - el.clientHeight;
    el.style.height = `${Math.min(full, 128)}px`;
    el.style.overflowY = full > 128 ? "auto" : "hidden";
  }, [draft, handoff.open]);

  useLayoutEffect(() => {
    const last = messages.at(-1);
    if (stick.current || last?.role === "user") {
      stick.current = true;
      toBottom();
      setUnread(0);
    } else if (messages.length > seen.current && last?.role === "assistant") {
      setUnread((n) => n + 1);
    }
    seen.current = messages.length;
  }, [messages, error, sent, handoff.open, toBottom]);

  useEffect(() => {
    const el = log.current;
    if (!el) return;
    const watch = new ResizeObserver(() => stick.current && toBottom());
    watch.observe(el);
    return () => watch.disconnect();
  }, [toBottom]);

  // On a phone the keyboard can cover a fixed layout; lift the chat by the part that is covered.
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv || !floating) return;
    const update = () => {
      const covered = root.current?.contains(document.activeElement) ? Math.max(0, window.innerHeight - vv.height - vv.offsetTop) : 0;
      root.current?.style.setProperty("--wp-covered", `${Math.round(covered)}px`);
    };
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    document.addEventListener("focusin", update);
    document.addEventListener("focusout", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
      document.removeEventListener("focusin", update);
      document.removeEventListener("focusout", update);
    };
  }, [floating]);

  function onScroll() {
    const el = log.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    stick.current = distance < 72;
    setAway(distance > 140);
    if (distance < 72) setUnread(0);
  }

  function say(text: string, topic?: string) {
    if (busy || !text.trim()) return;
    stick.current = true;
    send(text, topic);
  }

  function submit(event?: FormEvent) {
    event?.preventDefault();
    if (busy || !draft.trim()) return;
    say(draft);
    setDraft("");
    reportComposer(id, { hasText: false, focused: document.activeElement === input.current });
  }

  function onInput(value: string) {
    setDraft(value);
    reportKeystroke();
    reportComposer(id, { hasText: value.trim().length > 0, focused: true });
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      submit();
    }
  }

  const backToInput = () => requestAnimationFrame(() => input.current?.focus({ preventScroll: true }));

  const rows: Row[] = [
    ...GREETING.map((content, i): Row => ({ key: `hello-${i}`, role: "assistant", content, at: chat.openedAt })),
    ...messages.map((m): Row => ({ key: String(m.id), role: m.role, content: m.content, at: m.at, message: m })),
  ];
  const lastIndex = messages.length - 1;
  const deliveredFrom = (index: number) => messages.slice(index + 1).some((m) => m.role === "assistant" && m.content);
  const typingNow = status === "thinking" ? "thinking…" : status === "responding" ? "typing…" : activity === "listening" ? "listening…" : null;
  const statusLine = typingNow ?? "AI assistant";
  const note = mode === "mock" ? "Local mock replies: no AI model is connected." : mode === "unconfigured" ? "Chat is not set up in this environment." : "AI replies can be wrong. Please don’t share anything confidential.";
  const showChips = !hasUser;

  const chips = (
    <div className={styles.chips} role="group" aria-label="Suggested questions">
      {SUGGESTIONS.map((s) => (
        <button key={s.label} type="button" className={styles.chip} onClick={() => say(s.label, s.need)} disabled={busy}>
          {s.label}
        </button>
      ))}
    </div>
  );

  const teamButton = (
    <button type="button" className={styles.textButton} onClick={openHandoff} disabled={handoff.open} aria-label="Send this conversation to the team" title="Send this conversation to the team">
      <PlaneIcon />
      <span>Send to team</span>
    </button>
  );
  const restartButton = messages.length ? (
    <button
      type="button"
      className={styles.iconButton}
      onClick={() => {
        reset();
        setDraft("");
        reportComposer(id, null);
        stick.current = true;
      }}
      aria-label="Start a new conversation"
      title="Start a new conversation"
    >
      <RestartIcon />
    </button>
  ) : null;
  const closeButton = onClose ? (
    <button type="button" className={styles.iconButton} onClick={onClose} aria-label="Back" title="Back">
      <CloseIcon />
    </button>
  ) : null;

  const statusEl = (
    <p className={styles.status} data-live={typingNow ? true : undefined}>
      {statusLine}
    </p>
  );

  return (
    <section ref={root} className={styles.root} data-look="bubbles" data-floating={floating || undefined} aria-label="Chat with Windy Pup">
      <header className={styles.head}>
        <span className={styles.avatar}>
          <WindyMark size={30} tone="ink" />
        </span>
        <div className={styles.who}>
          <p className={styles.name}>Windy Pup</p>
          {statusEl}
        </div>
        <div className={styles.tools}>
          {teamButton}
          {restartButton}
          {closeButton}
        </div>
      </header>

      <div className={styles.threadWrap}>
        <div ref={log} className={styles.thread} role="log" aria-label="Conversation with Windy Pup" aria-busy={busy} onScroll={onScroll}>
          <div className={styles.day}>
            <span>Today</span>
          </div>
          {rows.map((row, i) => {
            const prev = rows[i - 1];
            const next = rows[i + 1];
            const first = !prev || prev.role !== row.role;
            const last = !next || next.role !== row.role;
            const index = row.message ? messages.indexOf(row.message) : -1;
            const typing = row.role === "assistant" && !row.content;
            const streaming = !!row.message && row.role === "assistant" && index === lastIndex && busy;
            const own = row.role === "user";
            const failed = own && !!error && !!row.message && index === lastIndex;
            const read = own && (row.message ? deliveredFrom(index) : true);
            return (
              <Fragment key={row.key}>
                <div className={styles.row} data-side={own ? "out" : "in"} data-first={first || undefined} data-last={last || undefined}>
                  <div className={styles.bubble} data-typing={typing || undefined} data-list-end={(!typing && parseMarkdown(row.content).at(-1)?.t !== "p") || undefined}>
                    <span className="sr-only">{own ? "You: " : "Windy Pup: "}</span>
                    {typing ? (
                      <span className={styles.dots} aria-hidden="true">
                        <i />
                        <i />
                        <i />
                      </span>
                    ) : (
                      <Markdown text={row.content} tail={<span className={styles.pad} data-own={own || undefined} aria-hidden="true" />} />
                    )}
                    {!typing && !streaming ? (
                      <span className={styles.meta} data-failed={failed || undefined}>
                        <time dateTime={new Date(row.at).toISOString()} suppressHydrationWarning>
                          {clock(row.at)}
                        </time>
                        {own ? (
                          failed ? (
                            <>
                              <WarnIcon />
                              <span className="sr-only">Not sent</span>
                            </>
                          ) : (
                            <>
                              <Ticks double={read} />
                              <span className="sr-only">{read ? "Delivered" : "Sent"}</span>
                            </>
                          )
                        ) : null}
                      </span>
                    ) : null}
                    {last ? (
                      <svg className={styles.tail} width="9" height="16" viewBox="0 0 9 16" aria-hidden="true" focusable="false">
                        <path className={styles.tailFill} d="M9 0C9 8 6 13 .5 15.5H9Z" />
                        <path className={styles.tailLine} d="M8.5 1C8.4 8 6 13 .5 15.5H9" />
                      </svg>
                    ) : null}
                  </div>
                </div>
                {row.key === `hello-${GREETING.length - 1}` && showChips ? chips : null}
                {row.message && sent && sent.afterId === row.message.id ? <SentNotice email={sent.email} /> : null}
              </Fragment>
            );
          })}
          {/* Sent before any message: there is no row to hang the notice on. */}
          {sent && !messages.some((m) => m.id === sent.afterId) ? <SentNotice email={sent.email} /> : null}
          {error ? (
            <div role="alert" className={styles.problem}>
              <WarnIcon />
              <p>
                {error}{" "}
                {mode !== "unconfigured" ? (
                  <button type="button" className={styles.link} onClick={retry}>
                    Try again
                  </button>
                ) : null}
              </p>
            </div>
          ) : null}
          {hasUser && !busy && !error && !sent && !handoff.open ? (
            <div className={styles.chips} data-after="">
              <button type="button" className={styles.chip} onClick={openHandoff}>
                Send this conversation to the team
              </button>
            </div>
          ) : null}
        </div>
        {away ? (
          <button
            type="button"
            className={styles.down}
            onClick={() => {
              stick.current = true;
              setUnread(0);
              toBottom(true);
            }}
            aria-label={unread ? `Scroll to the ${unread} new message${unread > 1 ? "s" : ""}` : "Scroll to the latest message"}
          >
            <ChevronDownIcon />
            {unread ? <span className={styles.badge}>{unread}</span> : null}
          </button>
        ) : null}
      </div>

      <div className={styles.dock}>
        {handoff.open ? (
          <Handoff
            messages={messages}
            need={handoff.need}
            openedAt={chat.openedAt}
            onCancel={() => {
              closeHandoff();
              backToInput();
            }}
            onSent={(email) => {
              markSent(email);
              backToInput();
            }}
          />
        ) : (
          <form className={styles.composer} onSubmit={submit}>
            <div className={styles.field}>
              <textarea
                ref={input}
                className={styles.input}
                rows={1}
                value={draft}
                onChange={(event) => onInput(event.target.value)}
                onKeyDown={onKeyDown}
                onFocus={() => reportComposer(id, { hasText: draft.trim().length > 0, focused: true })}
                onBlur={() => reportComposer(id, { hasText: draft.trim().length > 0, focused: false })}
                maxLength={MAX_MESSAGE_CHARS}
                enterKeyHint="send"
                placeholder="Message"
                aria-label="Your message"
              />
            </div>
            {busy ? (
              <button type="button" className={styles.send} onClick={stop} aria-label="Stop the reply" title="Stop">
                <StopIcon />
              </button>
            ) : (
              <button type="submit" className={styles.send} disabled={!draft.trim()} aria-label="Send message" title="Send">
                <ArrowUpIcon />
              </button>
            )}
          </form>
        )}
        {draft.length > MAX_MESSAGE_CHARS * 0.85 && !handoff.open ? (
          <p className={styles.note} aria-live="polite">
            {draft.length} of {MAX_MESSAGE_CHARS} characters
          </p>
        ) : null}
        {!handoff.open ? (
          <p className={styles.note}>
            {note} <a href={`mailto:${CONTACT_EMAIL}`}>Email us</a>
          </p>
        ) : null}
      </div>
    </section>
  );
}

function SentNotice({ email }: { email: string }) {
  return (
    <p className={styles.notice}>
      <CheckIcon />
      <span>
        Sent to the team. They’ll reply to <strong>{email}</strong>.
      </span>
    </p>
  );
}
