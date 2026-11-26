"use client";

import { createContext, createElement, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { MAX_MESSAGE_CHARS, MOODS, trimMessages, type Mood, type WindyErrorCode, type WindyEvent } from "@/lib/windy-pop/chat-schema";

export type { Mood };
export type ChatStatus = "idle" | "thinking" | "responding" | "error";
/**
 * What the visitor and the assistant are doing, for the dog to act out:
 * listening (the visitor is typing), thinking (waiting for the first words), talking (a reply is streaming).
 */
export type ChatActivity = "idle" | "listening" | "thinking" | "talking";
export type ChatMode = "live" | "mock" | "unconfigured" | "unknown";
export type UiMessage = { id: number; role: "user" | "assistant"; content: string; at: number };
export type HandoffState = {
  open: boolean;
  /** One of the contact form's topics, when a suggested question picked it. */
  need: string;
  /** Set once the conversation went to the team; `afterId` is the last message it included. */
  sent: { email: string; afterId: number } | null;
};

/** A listener for each streamed piece of text (to pulse the dog's mouth). */
export type ChunkListener = (chunk: string) => void;

/** How long after a keystroke the visitor still counts as typing, and how long a mood lingers after a reply. */
const LISTEN_MS = 1500;
const MOOD_HOLD_MS = 7000;

const MESSAGES: Record<WindyErrorCode | "generic" | "invalid_request", string> = {
  not_configured:
    "Windy Pup has no AI provider key in this environment. Set one on the server, or set WINDY_POP_MOCK=1 for clearly labelled local mock replies.",
  rate_limited: "That is a lot of questions in a short time. Please wait a minute and try again.",
  timeout: "That took too long to answer. Please try again.",
  blocked: "I could not answer that one. Try rephrasing it, or speak to the team.",
  empty_response: "I did not get an answer that time. Please try again.",
  upstream_error: "The AI service had a problem. Please try again shortly.",
  network: "I could not reach the server. Check your connection and try again.",
  invalid_request: "That message could not be sent. Try a shorter one.",
  generic: "Something went wrong. Please try again.",
};

export type WindyChat = {
  messages: UiMessage[];
  status: ChatStatus;
  error: string | null;
  mode: ChatMode;
  provider: string;
  activity: ChatActivity;
  /** The mood of the latest reply; back to "neutral" a few seconds after it ends. */
  mood: Mood;
  /** When the conversation opened (the enquiry action treats an instant send as a bot). */
  openedAt: number;
  send: (text: string, topic?: string) => void;
  stop: () => void;
  reset: () => void;
  retry: () => void;
  /** Subscribe to streamed text; returns the unsubscribe. */
  subscribe: (listener: ChunkListener) => () => void;
  /** Looks up whether the server is live, mock or unset; safe to call often. */
  wake: () => void;
  handoff: HandoffState;
  openHandoff: () => void;
  closeHandoff: () => void;
  markSent: (email: string) => void;
  /** Composers report whether they hold text and focus (per composer id), and each keystroke. */
  reportComposer: (id: string, state: { hasText: boolean; focused: boolean } | null) => void;
  reportKeystroke: () => void;
};

function useChatState(): WindyChat {
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [status, setStatus] = useState<ChatStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<ChatMode>("unknown");
  const [provider, setProvider] = useState("");
  const [mood, setMood] = useState<Mood>("neutral");
  const [handoff, setHandoff] = useState<HandoffState>({ open: false, need: "", sent: null });
  const [typing, setTyping] = useState(false);
  const [recentKey, setRecentKey] = useState(false);
  const [openedAt] = useState(() => Date.now());

  const listeners = useRef(new Set<ChunkListener>());
  const composers = useRef(new Map<string, { hasText: boolean; focused: boolean }>());
  const keyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const moodTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ref = useRef<UiMessage[]>([]);
  const idRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const rafRef = useRef<number | null>(null);
  const modeFetched = useRef(false);
  const lastUser = useRef<string | null>(null);

  const flush = useCallback(() => {
    rafRef.current = null;
    setMessages([...ref.current]);
  }, []);
  const schedule = useCallback(() => {
    if (rafRef.current === null) rafRef.current = requestAnimationFrame(flush);
  }, [flush]);
  const flushNow = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    flush();
  }, [flush]);

  const wake = useCallback(() => {
    if (modeFetched.current) return;
    modeFetched.current = true;
    fetch("/api/windy-pop/chat", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j: { mode?: string; provider?: unknown } | null) => {
        setMode(j?.mode === "live" || j?.mode === "mock" || j?.mode === "unconfigured" ? j.mode : "unknown");
        setProvider(typeof j?.provider === "string" ? j.provider.slice(0, 40) : "");
      })
      .catch(() => setMode("unknown"));
  }, []);

  useEffect(
    () => () => {
      abortRef.current?.abort();
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      if (keyTimer.current) clearTimeout(keyTimer.current);
      if (moodTimer.current) clearTimeout(moodTimer.current);
    },
    [],
  );

  // A mood is a reaction, not a state: it settles back to neutral a while after the reply ends.
  const holdMood = useCallback((next: Mood, settle: boolean) => {
    if (moodTimer.current) clearTimeout(moodTimer.current);
    setMood(next);
    moodTimer.current = settle && next !== "neutral" ? setTimeout(() => setMood("neutral"), MOOD_HOLD_MS) : null;
  }, []);

  const fail = useCallback(
    (code: keyof typeof MESSAGES) => {
      // Drop an empty assistant placeholder so the log does not show a blank reply.
      const last = ref.current.at(-1);
      if (last?.role === "assistant" && !last.content) ref.current = ref.current.slice(0, -1);
      flushNow();
      setError(MESSAGES[code] ?? MESSAGES.generic);
      setStatus("error");
      holdMood("sorry", true);
    },
    [flushNow, holdMood],
  );

  const run = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setError(null);
    setStatus("thinking");
    if (moodTimer.current) clearTimeout(moodTimer.current);
    ref.current = [...ref.current, { id: ++idRef.current, role: "assistant", content: "", at: Date.now() }];
    flushNow();

    const payload = trimMessages(ref.current.slice(0, -1).map(({ role, content }) => ({ role, content })));
    let gotDelta = false;
    let replyMood: Mood = "neutral";
    try {
      const res = await fetch("/api/windy-pop/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: payload }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        let code: keyof typeof MESSAGES = "generic";
        try {
          const j = (await res.json()) as { error?: { code?: string } };
          const c = j.error?.code;
          if (c && c in MESSAGES) code = c as keyof typeof MESSAGES;
        } catch {}
        if (res.status === 429) code = "rate_limited";
        if (res.status === 404) setMode("unknown");
        return fail(code);
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let finished = false;
      const handle = (line: string): boolean => {
        if (!line.trim()) return true;
        let ev: WindyEvent;
        try {
          ev = JSON.parse(line) as WindyEvent;
        } catch {
          return true;
        }
        if (ev.t === "mood") {
          if ((MOODS as readonly string[]).includes(ev.mood)) {
            replyMood = ev.mood;
            setMood(ev.mood);
          }
        } else if (ev.t === "delta") {
          if (!gotDelta) {
            gotDelta = true;
            setStatus("responding");
          }
          const last = ref.current[ref.current.length - 1];
          ref.current = [...ref.current.slice(0, -1), { ...last, content: last.content + ev.text }];
          schedule();
          listeners.current.forEach((l) => l(ev.text));
        } else if (ev.t === "done") {
          finished = true;
        } else if (ev.t === "error") {
          fail(ev.code in MESSAGES ? ev.code : "generic");
          finished = true;
          return false;
        }
        return true;
      };
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const l of lines) if (!handle(l)) return;
      }
      buf += decoder.decode();
      if (buf && !handle(buf)) return;
      if (!finished && !gotDelta) return fail("empty_response");
      flushNow();
      setStatus("idle");
      // Let the mood last a while, then settle.
      holdMood(replyMood, true);
    } catch (e) {
      if ((e as { name?: string }).name === "AbortError") return;
      fail("network");
    }
  }, [fail, flushNow, schedule, holdMood]);

  const send = useCallback(
    (text: string, topic?: string) => {
      const t = text.trim().slice(0, MAX_MESSAGE_CHARS);
      if (!t || status === "thinking" || status === "responding") return;
      if (topic) setHandoff((h) => (h.need ? h : { ...h, need: topic }));
      lastUser.current = t;
      // Sent: the visitor has stopped typing.
      if (keyTimer.current) clearTimeout(keyTimer.current);
      setRecentKey(false);
      ref.current = [...ref.current, { id: ++idRef.current, role: "user", content: t, at: Date.now() }];
      void run();
    },
    [run, status],
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
    const last = ref.current.at(-1);
    if (last?.role === "assistant" && !last.content) ref.current = ref.current.slice(0, -1);
    flushNow();
    setStatus("idle");
  }, [flushNow]);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    ref.current = [];
    lastUser.current = null;
    flushNow();
    setError(null);
    setStatus("idle");
    setHandoff({ open: false, need: "", sent: null });
    holdMood("neutral", false);
  }, [flushNow, holdMood]);

  const retry = useCallback(() => {
    if (status === "thinking" || status === "responding") return;
    if (ref.current.at(-1)?.role === "assistant") ref.current = ref.current.slice(0, -1);
    if (ref.current.at(-1)?.role !== "user") {
      if (!lastUser.current) return;
      ref.current = [...ref.current, { id: ++idRef.current, role: "user", content: lastUser.current, at: Date.now() }];
    }
    void run();
  }, [run, status]);

  const subscribe = useCallback((listener: ChunkListener) => {
    listeners.current.add(listener);
    return () => void listeners.current.delete(listener);
  }, []);

  const openHandoff = useCallback(() => setHandoff((h) => ({ ...h, open: true })), []);
  const closeHandoff = useCallback(() => setHandoff((h) => ({ ...h, open: false })), []);
  const markSent = useCallback((email: string) => setHandoff((h) => ({ ...h, open: false, sent: { email, afterId: ref.current.at(-1)?.id ?? -1 } })), []);

  const reportComposer = useCallback((id: string, state: { hasText: boolean; focused: boolean } | null) => {
    if (state) composers.current.set(id, state);
    else composers.current.delete(id);
    setTyping([...composers.current.values()].some((c) => c.hasText && c.focused));
  }, []);
  const reportKeystroke = useCallback(() => {
    setRecentKey(true);
    if (keyTimer.current) clearTimeout(keyTimer.current);
    keyTimer.current = setTimeout(() => setRecentKey(false), LISTEN_MS);
  }, []);

  const activity: ChatActivity = status === "thinking" ? "thinking" : status === "responding" ? "talking" : typing || recentKey ? "listening" : "idle";

  return { messages, status, error, mode, provider, activity, mood, openedAt, send, stop, reset, retry, subscribe, wake, handoff, openHandoff, closeHandoff, markSent, reportComposer, reportKeystroke };
}

const Context = createContext<WindyChat | null>(null);

/**
 * Owns one conversation. Every <Chat> (and anything else using useWindyChat) inside it shows the same
 * thread, so the hero, the corner panel and the contact section can be one conversation.
 */
export function WindyChatProvider({ children }: { children: ReactNode }) {
  return createElement(Context.Provider, { value: useChatState() }, children);
}

/** The shared conversation, or null outside a provider. */
export const useOptionalWindyChat = () => useContext(Context);

export function useWindyChat(): WindyChat {
  const chat = useContext(Context);
  if (!chat) throw new Error("useWindyChat must be used inside a WindyChatProvider");
  return chat;
}
