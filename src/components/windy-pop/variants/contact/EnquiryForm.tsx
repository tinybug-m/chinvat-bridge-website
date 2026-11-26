"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore, useTransition, type FocusEvent, type FormEvent } from "react";
import Link from "next/link";
import { sendEnquiry } from "@/actions/enquiry";
import { NEEDS, buildMessage, isEmail } from "@/components/home/contact/brief";
import { readJourney } from "@/components/site/journey";
import { Button } from "@/components/system/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useWindyChat } from "@/components/windy-pop/useWindyChat";
import { cn } from "@/lib/utils";
import { useDuo } from "../duo/DuoHome";
import styles from "./contact.module.css";

/*
 * The short enquiry form the three contact variants share: an optional topic, a message, a name and
 * an email. Visible labels, errors beside their fields (format is checked on leaving a field, gaps
 * only on sending), nothing typed is ever lost, and success replaces the form without moving the page.
 * `progressive` asks for the message first and shows the reply fields once there is something to send.
 */

type Field = "message" | "name" | "email";
const ORDER: Field[] = ["message", "name", "email"];
const EMPTY = { need: "", message: "", name: "", email: "" };

const never = () => () => {};

function check(field: Field, value: string): string | undefined {
  const v = value.trim();
  if (field === "message") return v ? undefined : "Write a sentence or two about what you need.";
  if (field === "name") return v ? undefined : "Add your name.";
  if (!v) return "Add your email so we can reply.";
  return isEmail(v) ? undefined : "Check the address, like name@company.com.";
}

export function EnquiryForm({ progressive = false, messageLabel = "How can we help?", placeholder }: { progressive?: boolean; messageLabel?: string; placeholder: string }) {
  const id = useId();
  const { cue, kick } = useDuo();
  const { reportKeystroke } = useWindyChat();
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [failure, setFailure] = useState("");
  const [sentTo, setSentTo] = useState("");
  const [revealed, setRevealed] = useState(!progressive);
  const [pending, start] = useTransition();
  const trap = useRef<HTMLInputElement>(null);
  const done = useRef<HTMLHeadingElement>(null);
  const openedAt = useRef(0);
  const startingAgain = useRef(false);
  // Until the script runs, sending stays off: a plain submit would put the visitor's details in the address.
  const ready = useSyncExternalStore(never, () => true, () => false);

  useEffect(() => {
    openedAt.current = Date.now();
  }, []);
  // Focus follows the state, once the form or the confirmation is really there to take it.
  useEffect(() => {
    if (sentTo) done.current?.focus({ preventScroll: true });
    else if (startingAgain.current) {
      startingAgain.current = false;
      document.getElementById(`${id}-message`)?.focus({ preventScroll: true });
    }
  }, [sentTo, id]);

  function change(key: keyof typeof EMPTY, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
    // Once there is something to send, ask where to reply; the fields then stay.
    if ((key === "message" && value.trim()) || key === "need") setRevealed(true);
    if (key !== "need") {
      reportKeystroke();
      if (errors[key]) setErrors((current) => ({ ...current, [key]: check(key, value) }));
    }
  }

  const field = (key: Field) => ({
    id: `${id}-${key}`,
    name: key,
    value: values[key],
    "aria-invalid": errors[key] ? true : undefined,
    "aria-describedby": errors[key] ? `${id}-${key}-error` : undefined,
    onFocus: () => kick(600),
    onBlur: (event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value;
      if (value.trim()) setErrors((current) => ({ ...current, [key]: check(key, value) }));
    },
  });

  const error = (key: Field) =>
    errors[key] ? (
      <p id={`${id}-${key}-error`} className="text-small text-destructive">
        {errors[key]}
      </p>
    ) : null;

  function submit(event: FormEvent) {
    event.preventDefault();
    if (pending) return;
    const found: Partial<Record<Field, string>> = {};
    for (const key of ORDER) {
      const problem = check(key, values[key]);
      if (problem) found[key] = problem;
    }
    setErrors(found);
    const first = ORDER.find((key) => found[key]);
    if (first) {
      setRevealed(true);
      requestAnimationFrame(() => document.getElementById(`${id}-${first}`)?.focus());
      return;
    }
    setFailure("");
    start(async () => {
      let result: Awaited<ReturnType<typeof sendEnquiry>>;
      try {
        result = await sendEnquiry({ ...values, company: "", website: trap.current?.value ?? "", elapsed: Date.now() - openedAt.current, journey: readJourney() });
      } catch {
        result = { status: "error", message: "That didn’t go through." };
      }
      if (result.status === "sent") {
        setSentTo(values.email.trim());
        cue("hop");
      } else setFailure(result.message);
    });
  }

  function again() {
    setValues((current) => ({ ...EMPTY, name: current.name, email: current.email }));
    setSentTo("");
    setRevealed(!progressive);
    openedAt.current = Date.now();
    startingAgain.current = true;
  }

  return (
    // The two states share one cell, so sending never changes the card's height.
    <div className="grid">
      <form noValidate onSubmit={submit} className={cn("col-start-1 row-start-1 flex flex-col gap-5", sentTo && "opacity-0")} inert={!!sentTo || undefined}>
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${id}-message`} className={progressive ? "text-heading leading-tight" : undefined}>
            {messageLabel}
          </Label>
          <Textarea {...field("message")} rows={4} maxLength={5000} placeholder={placeholder} onChange={(e) => change("message", e.target.value)} className="min-h-32" />
          {error("message")}
        </div>

        <fieldset>
          <legend className="mb-2 text-small font-medium text-ink">
            Topic <span className="font-normal text-ink-muted">(optional)</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {NEEDS.map((need) => (
              <label
                key={need}
                className="inline-flex min-h-11 cursor-pointer items-center rounded-full border border-line-strong px-4 text-small text-ink transition-colors hover:border-ink has-checked:border-ink has-checked:bg-ink has-checked:text-paper has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-cobalt-700"
              >
                <input type="radio" name={`${id}-need`} value={need} checked={values.need === need} onChange={() => change("need", need)} className="sr-only" />
                {need}
              </label>
            ))}
          </div>
        </fieldset>

        {revealed ? (
          <div className={cn("flex flex-col gap-5", progressive && styles.rise)}>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor={`${id}-name`}>Your name</Label>
                <Input {...field("name")} autoComplete="name" maxLength={120} onChange={(e) => change("name", e.target.value)} />
                {error("name")}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor={`${id}-email`}>Email</Label>
                <Input {...field("email")} type="email" inputMode="email" autoComplete="email" maxLength={254} onChange={(e) => change("email", e.target.value)} />
                {error("email")}
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
              <Button type="submit" size="lg" arrow={pending ? undefined : "right"} disabled={pending || !ready} className="max-sm:w-full">
                {pending ? "Sending…" : "Send message"}
              </Button>
              <p className="text-small text-ink-muted">
                We use these details to reply.{" "}
                <Link href="/privacy" className="underline underline-offset-2 hover:text-ink">
                  Privacy
                </Link>
              </p>
            </div>
          </div>
        ) : (
          <p className="text-small text-ink-muted">Start writing and we’ll ask where to reply.</p>
        )}

        {/* A field people never see: anything in it means a bot. */}
        <input ref={trap} name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
        {failure ? (
          <p role="alert" className="text-small text-destructive">
            {failure} Your message is still here. You can also{" "}
            <a className="text-ink underline underline-offset-2" href={buildMessage({ ...values, company: "", needs: values.need ? [values.need] : [] }).mailto}>
              send it from your email app
            </a>
            .
          </p>
        ) : null}
      </form>

      {sentTo ? (
        <div className={cn("col-start-1 row-start-1 flex flex-col items-start justify-center gap-4", styles.rise)}>
          <h3 ref={done} tabIndex={-1} className="font-display text-heading font-medium text-ink outline-none">
            Message sent.
          </h3>
          <p className="max-w-measure text-body text-ink-soft">
            Thanks, {values.name.trim().split(/\s+/)[0]}. We’ll reply to <strong className="font-medium text-ink">{sentTo}</strong>.
          </p>
          <Button variant="secondary" onClick={again}>
            Send another
          </Button>
        </div>
      ) : null}
    </div>
  );
}
