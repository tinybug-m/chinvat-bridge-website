"use client";

import { useEffect, useId, useRef, useState, useTransition, type FormEvent, type KeyboardEvent } from "react";
import { sendEnquiry } from "@/actions/enquiry";
import { useReducedMotion } from "@/components/motion/useReducedMotion";
import { Button, buttonVariants } from "@/components/system/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EMPTY_BRIEF, NEEDS, buildMessage, isEmail, type BriefValues } from "./brief";
import "./contact.css";

/*
 * The brief as a short conversation with the two people who will read it.
 * Three steps at most: tap what it is about (or just type), say a sentence
 * about it, then name and email together, which sends. Any answer can be
 * edited by clicking it, which rewinds the conversation to that point.
 *
 * It is a fixed script, not an AI: every line is written here. Sending posts
 * the answers to a server action that emails them to the team (see
 * actions/enquiry.ts), so the visitor never leaves the page. If that fails,
 * the error offers the visitor's email app with the brief filled in instead. The thread scrolls inside a fixed window, so the
 * page never jumps as it grows, and the answer area below it changes with the
 * step. Our lines arrive after a short typing pause (none under reduced
 * motion). The thread is a role="log", so screen readers hear each new line.
 */

type Step = "start" | "details" | "contact" | "sent";
type Need = (typeof NEEDS)[number];

interface Line {
  id: number;
  from: "us" | "you";
  text: string;
  /** For the visitor's lines: the step this answered, so clicking it can rewind there. */
  step?: Step;
}

const GREETING = "Hi, thanks for stopping by. What can we help you with?";

/** The follow-up question, shaped by the topic they tapped. */
const FOLLOW_UP: Record<Need, string> = {
  "AI & Automation": "Good. What would you like to automate, or hand over to AI?",
  Workflows: "Good. Which process feels slow or messy right now?",
  "Software & Web": "Good. What would you like built?",
  "SEO & Growth": "Good. What would you like to grow, and where are you now?",
  "Not sure yet": "That’s fine. What’s slowing your business down at the moment?",
};

const ASK_CONTACT = "Thanks, that’s clear. Where should we send our reply?";
/** Our last line, once the message has reached us. */
const sent = (values: BriefValues) =>
  `Got it, thanks ${values.name.trim().split(/\s+/)[0]}. Your message is with us, and we’ll reply to ${values.email.trim()}.`;

const PROGRESS: Record<Step, string> = { start: "1 of 3", details: "2 of 3", contact: "3 of 3", sent: "Sent" };

const isNeed = (text: string): text is Need => (NEEDS as readonly string[]).includes(text);

/** A short pause that reads like someone typing. */
const typingTime = (text: string) => Math.min(800, 300 + text.length * 5);

type ContactErrors = Partial<Record<"name" | "email", string>>;

export function ContactChat() {
  const reduced = useReducedMotion();
  const baseId = useId();
  const [values, setValues] = useState<BriefValues>(EMPTY_BRIEF);
  const [step, setStep] = useState<Step>("start");
  const [lines, setLines] = useState<Line[]>([{ id: 0, from: "us", text: GREETING }]);
  const [typing, setTyping] = useState(false);
  const [draft, setDraft] = useState("");
  const [errors, setErrors] = useState<ContactErrors>({});
  const [sendError, setSendError] = useState("");
  const [sending, startSending] = useTransition();

  const nextId = useRef(1);
  const timer = useRef<number>(0);
  /** Only move focus once the visitor has answered something: never on page load. */
  const engaged = useRef(false);
  const threadRef = useRef<HTMLDivElement>(null);
  const answerRef = useRef<HTMLDivElement>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);
  /** When the conversation opened; the server treats a send within seconds of it as a bot. */
  const openedAt = useRef(0);

  useEffect(() => {
    openedAt.current = Date.now();
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  // Keep the newest line in view inside the window (the page itself does not scroll).
  useEffect(() => {
    const thread = threadRef.current;
    if (thread) thread.scrollTo({ top: thread.scrollHeight, behavior: reduced ? "auto" : "smooth" });
  }, [lines.length, typing, reduced]);

  // Once our line lands, put the caret in the first field of the answer area.
  useEffect(() => {
    if (typing || !engaged.current) return;
    answerRef.current?.querySelector<HTMLElement>("textarea, input, button")?.focus({ preventScroll: true });
  }, [typing, step]);

  const line = (from: Line["from"], text: string, answered?: Step): Line => ({ id: nextId.current++, from, text, step: answered });

  /** Adds the visitor's answer, then our reply after a typing pause, then moves to `next`. */
  function advance(answer: string, answered: Step, reply: string, next: Step) {
    engaged.current = true;
    setDraft("");
    setLines((current) => [...current, line("you", answer, answered)]);
    const land = () => {
      setTyping(false);
      setLines((current) => [...current, line("us", reply)]);
      setStep(next);
    };
    if (reduced) return land();
    setTyping(true);
    timer.current = window.setTimeout(land, typingTime(reply));
  }

  function pickNeed(need: Need) {
    setValues((current) => ({ ...current, needs: [need] }));
    advance(need, "start", FOLLOW_UP[need], "details");
  }

  function sendText(event?: FormEvent) {
    event?.preventDefault();
    const text = draft.trim();
    if (!text || typing) return;
    // Typing straight away at the start skips the topic: the message says it all.
    setValues((current) => ({ ...current, message: text, needs: step === "start" ? [] : current.needs }));
    advance(text, step, ASK_CONTACT, "contact");
  }

  // Enter sends; Shift+Enter keeps a new line.
  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      sendText();
    }
  }

  function sendBrief(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found: ContactErrors = {};
    if (!values.name.trim()) found.name = "Add your name so we know who we’re talking to.";
    if (!isEmail(values.email)) found.email = values.email.trim() ? "Check the address, like name@company.com." : "Add your email so we can reply.";
    setErrors(found);
    const first = (["name", "email"] as const).find((field) => found[field]);
    if (first) {
      document.getElementById(`${baseId}-${first}`)?.focus();
      return;
    }
    if (sending) return;
    setSendError("");
    startSending(async () => {
      let result: Awaited<ReturnType<typeof sendEnquiry>>;
      try {
        result = await sendEnquiry({
          name: values.name,
          email: values.email,
          company: values.company,
          need: values.needs[0] ?? "",
          message: values.message,
          website: honeypotRef.current?.value ?? "",
          elapsed: Date.now() - openedAt.current,
        });
      } catch {
        // Offline, or a new deploy retired this action: the visitor can still reach us.
        result = { status: "error", message: "That didn’t go through." };
      }
      if (result.status === "sent") {
        const who = [values.name.trim(), values.email.trim(), values.company.trim()].filter(Boolean).join(", ");
        advance(who, "contact", sent(values), "sent");
      } else {
        setSendError(result.message);
      }
    });
  }

  /** Rewinds to the step an answer belongs to, with a typed answer back in the box to change. */
  function edit(target: Line) {
    // Once it has reached us, rewinding would only send it twice.
    if (!target.step || typing || step === "sent") return;
    window.clearTimeout(timer.current);
    engaged.current = true;
    setSendError("");
    setErrors({});
    setLines((current) => current.slice(0, current.findIndex((l) => l.id === target.id)));
    setStep(target.step);
    const typed = target.step !== "contact" && !(target.step === "start" && isNeed(target.text));
    setDraft(typed ? target.text : "");
  }

  function restart() {
    window.clearTimeout(timer.current);
    engaged.current = true;
    setTyping(false);
    setValues(EMPTY_BRIEF);
    setDraft("");
    setErrors({});
    setSendError("");
    setStep("start");
    setLines([line("us", GREETING)]);
  }

  const set = (key: "name" | "email" | "company", value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
    if (key !== "company" && errors[key]) setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const lastOurs = [...lines].reverse().find((l) => l.from === "us");
  const questionId = lastOurs ? `${baseId}-line-${lastOurs.id}` : undefined;

  // One height throughout, so the page never grows as the conversation does; lower on a phone, where
  // the full height opened on a tall empty well above the first line.
  return (
    <div className="flex h-[min(30rem,70svh)] flex-col rounded-[2px] border border-line bg-paper-raised md:h-[min(38rem,80svh)]">
      <div className="flex items-baseline justify-between gap-4 border-b border-line px-5 py-3.5">
        <p className="text-body font-medium text-ink">Chinvat Bridge</p>
        <p className="text-small tabular-nums text-ink-muted">{PROGRESS[step]}</p>
      </div>

      {/* The log scrolls; the list inside it keeps its own role, so each line is still a list item. */}
      <div
        ref={threadRef}
        role="log"
        aria-label="Conversation with Chinvat Bridge"
        className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 py-5"
      >
        <ol className="mt-auto flex list-none flex-col gap-3">
          {lines.map((l) =>
            l.from === "us" ? (
              <li key={l.id} id={`${baseId}-line-${l.id}`} className="chat-line max-w-[30rem] self-start text-pretty text-body text-ink">
                <span className="sr-only">Chinvat Bridge: </span>
                {l.text}
              </li>
            ) : (
              <li key={l.id} className="chat-line max-w-[30rem] self-end">
                <button
                  type="button"
                  disabled={step === "sent"}
                  onClick={() => edit(l)}
                  className="group/answer block rounded-[2px] bg-ink px-4 py-2.5 text-left text-body whitespace-pre-line text-paper outline-offset-2 transition-opacity hover:opacity-90"
                >
                  <span className="sr-only">You: </span>
                  {l.text}
                  {step === "sent" ? null : (
                    <span className="mt-0.5 block text-right text-[0.75rem] text-paper/60 group-hover/answer:text-paper">
                      Edit<span className="sr-only"> this answer</span>
                    </span>
                  )}
                </button>
              </li>
            ),
          )}
          {typing ? (
            <li aria-hidden="true" className="chat-typing self-start">
              <span />
              <span />
              <span />
            </li>
          ) : null}
        </ol>
      </div>

      <div ref={answerRef} className="border-t border-line px-5 py-4" hidden={typing}>
        {step === "start" ? (
          <div role="group" aria-labelledby={questionId} className="mb-3 flex flex-wrap gap-2">
            {NEEDS.map((need) => (
              <button key={need} type="button" className={buttonVariants({ variant: "secondary" })} onClick={() => pickNeed(need)}>
                {need}
              </button>
            ))}
          </div>
        ) : null}

        {step === "start" || step === "details" ? (
          <form onSubmit={sendText} className="flex items-end gap-2">
            <Textarea
              aria-labelledby={questionId}
              rows={1}
              placeholder={step === "start" ? "Or tell us in your own words" : "A sentence or two is plenty"}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={onKeyDown}
              className="max-h-40 min-h-12 resize-none py-2.5"
            />
            <Button type="submit" className="min-h-12" disabled={!draft.trim()}>
              Send
            </Button>
          </form>
        ) : null}

        {step === "contact" ? (
          <form noValidate onSubmit={sendBrief} aria-labelledby={questionId} className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`${baseId}-name`}>Name</Label>
              <Input
                id={`${baseId}-name`}
                autoComplete="name"
                value={values.name}
                onChange={(event) => set("name", event.target.value)}
                aria-invalid={errors.name ? true : undefined}
                aria-describedby={errors.name ? `${baseId}-name-error` : undefined}
              />
              {errors.name ? (
                <p id={`${baseId}-name-error`} className="text-small text-destructive">
                  {errors.name}
                </p>
              ) : null}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`${baseId}-email`}>Email</Label>
              <Input
                id={`${baseId}-email`}
                type="email"
                autoComplete="email"
                value={values.email}
                onChange={(event) => set("email", event.target.value)}
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={errors.email ? `${baseId}-email-error` : undefined}
              />
              {errors.email ? (
                <p id={`${baseId}-email-error`} className="text-small text-destructive">
                  {errors.email}
                </p>
              ) : null}
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor={`${baseId}-company`}>
                Company <span className="font-normal text-ink-muted">(optional)</span>
              </Label>
              <Input
                id={`${baseId}-company`}
                autoComplete="organization"
                value={values.company}
                onChange={(event) => set("company", event.target.value)}
              />
            </div>
            {/* Honeypot: hidden from people and screen readers; bots that fill every field give themselves away. */}
            <input ref={honeypotRef} name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
            <div className="sm:col-span-2">
              <Button type="submit" size="lg" arrow={sending ? undefined : "right"} disabled={sending}>
                {sending ? "Sending…" : "Send message"}
              </Button>
              <p role="status" aria-live="polite" className="mt-3 text-small text-destructive empty:hidden">
                {sendError ? (
                  <>
                    {sendError} Try again, or{" "}
                    <a className="text-ink underline underline-offset-2" href={buildMessage(values).mailto}>
                      email it to us instead
                    </a>
                    .
                  </>
                ) : null}
              </p>
            </div>
          </form>
        ) : null}

        {step === "sent" ? (
          <Button variant="quiet" onClick={restart}>
            Send another message
          </Button>
        ) : null}
      </div>
    </div>
  );
}
