import { CONTACT_EMAIL } from "@/lib/constants";

export function ComingSoonNotice({ children }: { children: string }) {
  return (
    <div className="px-5 py-6 sm:px-6">
      <p className="max-w-[34rem] text-small text-pretty text-ink-soft">
        {children} In the meantime, reach your consultant directly at{" "}
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="break-words text-cobalt-700 underline decoration-cobalt-700/35 underline-offset-[0.22em] hover:decoration-cobalt-700"
        >
          {CONTACT_EMAIL}
        </a>
        .
      </p>
    </div>
  );
}
