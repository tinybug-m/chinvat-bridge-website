"use client";

import { useEffect, useId, useRef, useState, useTransition, type FormEvent } from "react";
import { sendEnquiry } from "@/actions/enquiry";
import { isEmail } from "@/components/home/contact/brief";
import { readJourney } from "@/components/site/journey";
import { CONTACT_EMAIL } from "@/lib/constants";
import { CloseIcon } from "./chat-icons";
import type { UiMessage } from "./useWindyChat";
import styles from "./chat.module.css";

/** The enquiry action keeps 5000 characters. */
const LIMIT = 5000;

/** The visitor's side and the assistant's, as plain text for the team. The oldest lines go first if it is long. */
export function buildTranscript(messages: UiMessage[]): string {
  const head = "Conversation with Windy Pup (the AI assistant on the website):";
  const lines = messages.filter((m) => m.content.trim()).map((m) => `${m.role === "user" ? "Visitor" : "Windy Pup"}: ${m.content.trim()}`);
  let kept = lines;
  const size = (l: string[]) => head.length + 2 + l.join("\n\n").length + 40;
  while (kept.length > 1 && size(kept) > LIMIT) kept = kept.slice(1);
  const omitted = kept.length < lines.length ? "(Earlier messages left out.)" : "";
  return [head, omitted, ...kept].filter(Boolean).join("\n\n").slice(0, LIMIT);
}

type Props = {
  messages: UiMessage[];
  /** One of the contact form's topics, when a suggested question picked it. */
  need: string;
  /** When this conversation opened: the server treats an instant send as a bot. */
  openedAt: number;
  onCancel: () => void;
  onSent: (email: string) => void;
};

export function Handoff({ messages, need, openedAt, onCancel, onSent }: Props) {
  const id = useId();
  const hasConversation = messages.some((m) => m.role === "user");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Partial<Record<"name" | "email" | "note", string>>>({});
  const [failure, setFailure] = useState("");
  const [pending, start] = useTransition();
  const first = useRef<HTMLInputElement>(null);
  const trap = useRef<HTMLInputElement>(null);

  useEffect(() => first.current?.focus({ preventScroll: true }), []);

  function submit(event: FormEvent) {
    event.preventDefault();
    const next: typeof errors = {};
    if (!name.trim()) next.name = "Please add your name.";
    if (!isEmail(email)) next.email = "Please enter a valid email address.";
    if (!hasConversation && !note.trim()) next.note = "Please say a little about what you need.";
    setErrors(next);
    setFailure("");
    if (Object.keys(next).length) {
      (document.getElementById(`${id}-${next.name ? "name" : next.email ? "email" : "note"}`) as HTMLElement | null)?.focus();
      return;
    }
    const message = hasConversation ? buildTranscript(messages) : note.trim();
    start(async () => {
      let result: Awaited<ReturnType<typeof sendEnquiry>>;
      try {
        result = await sendEnquiry({
          name,
          email,
          company: "",
          need,
          message,
          website: trap.current?.value ?? "",
          elapsed: Date.now() - openedAt,
          journey: readJourney(),
        });
      } catch {
        result = { status: "error", message: "That didn’t go through." };
      }
      if (result.status === "sent") onSent(email.trim());
      else setFailure(result.message);
    });
  }

  const invalid = (key: keyof typeof errors) => (errors[key] ? true : undefined);
  const described = (key: keyof typeof errors) => (errors[key] ? `${id}-${key}-error` : undefined);

  return (
    <form className={styles.handoff} noValidate onSubmit={submit} onKeyDown={(e) => e.key === "Escape" && onCancel()} aria-labelledby={`${id}-title`}>
      <div className={styles.handoffHead}>
        <h2 id={`${id}-title`}>Send this conversation to the team</h2>
        <button type="button" className={styles.iconButton} onClick={onCancel} aria-label="Close this form">
          <CloseIcon />
        </button>
      </div>
      <p className={styles.handoffHint}>{hasConversation ? "A person will read it and reply by email." : "A person will read your message and reply by email."}</p>
      <div className={styles.fields}>
        <div className={styles.field}>
          <label htmlFor={`${id}-name`}>Name</label>
          <input ref={first} id={`${id}-name`} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" maxLength={120} aria-invalid={invalid("name")} aria-describedby={described("name")} />
          {errors.name ? <span id={`${id}-name-error`} className={styles.fieldError}>{errors.name}</span> : null}
        </div>
        <div className={styles.field}>
          <label htmlFor={`${id}-email`}>Email</label>
          <input id={`${id}-email`} type="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" maxLength={254} aria-invalid={invalid("email")} aria-describedby={described("email")} />
          {errors.email ? <span id={`${id}-email-error`} className={styles.fieldError}>{errors.email}</span> : null}
        </div>
        {!hasConversation ? (
          <div className={`${styles.field} ${styles.wide}`}>
            <label htmlFor={`${id}-note`}>Message</label>
            <textarea id={`${id}-note`} rows={3} value={note} onChange={(e) => setNote(e.target.value)} maxLength={1500} aria-invalid={invalid("note")} aria-describedby={described("note")} />
            {errors.note ? <span id={`${id}-note-error`} className={styles.fieldError}>{errors.note}</span> : null}
          </div>
        ) : null}
        {/* A field people never see: anything in it means a bot. */}
        <input ref={trap} className={styles.trap} name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" defaultValue="" />
      </div>
      {failure ? (
        <p role="alert" className={styles.formError}>
          {failure} You can also email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      ) : null}
      <div className={styles.handoffActions}>
        <button type="button" className={styles.ghost} onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className={styles.primary} disabled={pending} aria-busy={pending || undefined}>
          {pending ? "Sending…" : "Send to the team"}
        </button>
      </div>
    </form>
  );
}
