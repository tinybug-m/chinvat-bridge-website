"use client";

import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { drawProps } from "@/components/motion/draw";
import { Button } from "@/components/system/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CONTACT_EMAIL } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  EMPTY_BRIEF,
  MIN_MESSAGE,
  NEEDS,
  TIMELINES,
  buildMessage,
  describeErrors,
  validateBrief,
  type BriefField,
  type BriefMessage,
  type BriefValues,
} from "./brief";

const GROUP_LABEL = "text-small font-medium leading-snug text-ink";

function FieldError({ id, children }: { id: string; children?: string }) {
  return (
    <p id={id} className={cn("mt-2 text-small text-destructive", !children && "hidden")}>
      {children}
    </p>
  );
}

function Field({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex flex-col gap-2", className)}>{children}</div>;
}

type Manual = { text: string; label: string } | null;

export function ContactBrief() {
  const [values, setValues] = useState<BriefValues>(EMPTY_BRIEF);
  const [attempted, setAttempted] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [sent, setSent] = useState<BriefMessage | null>(null);
  const [copyStatus, setCopyStatus] = useState("");
  const [manual, setManual] = useState<Manual>(null);

  const panelRef = useRef<HTMLDivElement>(null);
  const manualRef = useRef<HTMLTextAreaElement>(null);

  const errors = attempted ? validateBrief(values) : {};
  const errorCount = Object.keys(errors).length;
  const set = <K extends keyof BriefValues>(key: K, value: BriefValues[K]) =>
    setValues((current) => ({ ...current, [key]: value }));

  const aria = (field: BriefField) =>
    errors[field] ? { "aria-invalid": true as const, "aria-describedby": `brief-${field}-error` } : {};

  function focusField(field: BriefField) {
    const selector = field === "needs" ? "#brief-needs button" : `#brief-${field}`;
    document.querySelector<HTMLElement>(selector)?.focus();
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAttempted(true);
    setCopyStatus("");
    setManual(null);
    const found = validateBrief(values);
    const invalid = (Object.keys(found) as BriefField[]).sort(
      (a, b) => ["name", "email", "needs", "message"].indexOf(a) - ["name", "email", "needs", "message"].indexOf(b),
    );
    if (invalid.length) {
      setSent(null);
      setAnnouncement(describeErrors(invalid.length));
      focusField(invalid[0]);
      return;
    }

    const message = buildMessage(values);
    setSent(message);
    setAnnouncement("Your email app should open. Copy options are below if it does not.");
    // A programmatic anchor click opens the mail client without leaving the page.
    const link = document.createElement("a");
    link.href = message.mailto;
    link.click();
    requestAnimationFrame(() => panelRef.current?.focus());
  }

  async function copy(text: string, label: string, done: string) {
    try {
      await navigator.clipboard.writeText(text);
      setManual(null);
      setCopyStatus(done);
    } catch {
      setManual({ text, label });
      setCopyStatus("Copying was blocked. The text is selected below: copy it with your keyboard.");
      requestAnimationFrame(() => {
        manualRef.current?.focus();
        manualRef.current?.select();
      });
    }
  }

  return (
    <form noValidate onSubmit={onSubmit} aria-label="Project brief" className="grid gap-x-6 gap-y-7 sm:grid-cols-2">
      <Field>
        <Label htmlFor="brief-name">Name</Label>
        <Input
          id="brief-name"
          name="name"
          autoComplete="name"
          value={values.name}
          onChange={(event) => set("name", event.target.value)}
          {...aria("name")}
        />
        <FieldError id="brief-name-error">{errors.name}</FieldError>
      </Field>

      <Field>
        <Label htmlFor="brief-email">Email</Label>
        <Input
          id="brief-email"
          name="email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={(event) => set("email", event.target.value)}
          {...aria("email")}
        />
        <FieldError id="brief-email-error">{errors.email}</FieldError>
      </Field>

      <Field className="sm:col-span-2">
        <Label htmlFor="brief-company">
          Company <span className="font-normal text-ink-muted">(optional)</span>
        </Label>
        <Input
          id="brief-company"
          name="company"
          autoComplete="organization"
          value={values.company}
          onChange={(event) => set("company", event.target.value)}
        />
      </Field>

      <Field className="sm:col-span-2">
        <span id="brief-needs-label" className={GROUP_LABEL}>
          What do you need?
        </span>
        <ToggleGroup
          id="brief-needs"
          role="group"
          type="multiple"
          variant="outline"
          spacing={2}
          aria-labelledby="brief-needs-label"
          className="w-full flex-wrap [&[aria-invalid=true]_[data-state=off]]:shadow-[inset_0_0_0_1px_var(--color-destructive)]"
          value={values.needs}
          onValueChange={(next) => set("needs", next)}
          {...aria("needs")}
        >
          {NEEDS.map((need) => (
            <ToggleGroupItem key={need} value={need}>
              {need}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <FieldError id="brief-needs-error">{errors.needs}</FieldError>
      </Field>

      <Field className="sm:col-span-2">
        <span id="brief-timeline-label" className={GROUP_LABEL}>
          Timeline <span className="font-normal text-ink-muted">(optional)</span>
        </span>
        <ToggleGroup
          type="single"
          variant="outline"
          spacing={2}
          aria-labelledby="brief-timeline-label"
          className="w-full flex-wrap"
          value={values.timeline}
          onValueChange={(next) => set("timeline", next)}
        >
          {TIMELINES.map((timeline) => (
            <ToggleGroupItem key={timeline} value={timeline}>
              {timeline}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </Field>

      <Field className="sm:col-span-2">
        <Label htmlFor="brief-message">Message</Label>
        <Textarea
          id="brief-message"
          name="message"
          value={values.message}
          onChange={(event) => set("message", event.target.value)}
          aria-describedby={errors.message ? "brief-message-error brief-message-hint" : "brief-message-hint"}
          aria-invalid={errors.message ? true : undefined}
        />
        <div className="flex items-start justify-between gap-4">
          <div>
            <FieldError id="brief-message-error">{errors.message}</FieldError>
          </div>
          <p id="brief-message-hint" className="ml-auto mt-0 whitespace-nowrap text-small tabular-nums text-ink-muted">
            {values.message.trim().length} / {MIN_MESSAGE} minimum
          </p>
        </div>
      </Field>

      <div className="flex flex-col gap-3 sm:col-span-2">
        {/* The same count the live region announces, in view until every field is right. */}
        {errorCount ? (
          <p id="brief-error-count" className="text-small font-medium text-destructive">{describeErrors(errorCount)}</p>
        ) : null}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <Button type="submit" size="lg" arrow="right">
            Send brief
          </Button>
          <p className="max-w-[36ch] text-small text-ink-muted">Opens your email app with the brief filled in.</p>
        </div>
      </div>

      <p role="status" aria-live="polite" className="sr-only">
        {announcement}
      </p>

      {sent ? (
        <div
          ref={panelRef}
          tabIndex={-1}
          aria-labelledby="brief-sent-title"
          role="group"
          className="relative border-t border-line-strong pt-7 outline-offset-4 sm:col-span-2"
        >
          <div className="flex items-start gap-3">
            {/* A real state change: the tick is drawn once as the panel appears (the draw helper in motion.css). */}
            <Reveal as="span" className="mt-0.5 shrink-0">
              <svg aria-hidden="true" focusable="false" viewBox="0 0 16 16" fill="none" stroke="currentColor" className="size-5 text-cobalt-700">
                <path d="M3 8.5l3.5 3.5L13 4.5" strokeLinecap="butt" strokeLinejoin="miter" {...drawProps(1.5, { duration: 400 })} />
              </svg>
            </Reveal>
            <p id="brief-sent-title" className="text-body font-medium text-ink">
              Your email app should open. If it didn&rsquo;t:
            </p>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button
              variant="secondary"
              onClick={() => copy(`Subject: ${sent.subject}\n\n${sent.body}`, "Message", "Message copied to the clipboard.")}
            >
              Copy message
            </Button>
            <Button variant="secondary" onClick={() => copy(CONTACT_EMAIL, "Address", "Address copied to the clipboard.")}>
              Copy address
            </Button>
          </div>
          <p role="status" aria-live="polite" className="mt-4 min-h-6 text-small text-ink-soft">
            {copyStatus}
          </p>
          {manual ? (
            <div className="mt-2 flex flex-col gap-2">
              <Label htmlFor="brief-manual">{manual.label} to copy</Label>
              <Textarea
                ref={manualRef}
                id="brief-manual"
                readOnly
                value={manual.text}
                onFocus={(event) => event.currentTarget.select()}
                className="min-h-28 font-label text-small"
              />
            </div>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}
