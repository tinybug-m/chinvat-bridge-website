import { Panel } from "@/components/portal/Panel";
import { Button, buttonVariants } from "@/components/system/Button";
import { ArrowIcon } from "@/components/system/ArrowIcon";
import { CONTACT_EMAIL, CONTACT_MAILTO } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function AdvisoryChannel() {
  return (
    <Panel title="Advisory channel">
      <div className="space-y-6 px-5 py-5 sm:px-6">
        <div className="border-l-2 border-saffron-500 pl-4">
          <p className="text-small font-medium text-ink">Priority advisory access</p>
          <p className="mt-1 text-small text-pretty text-ink-soft">
            Direct access to your designated SEO consultant &mdash; included with the Growth and Scale plans.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Button variant="secondary" disabled className="w-full border border-dashed border-line-strong text-ink-muted shadow-none disabled:opacity-100">
            Schedule strategy call (coming soon)
          </Button>
          <a
            href={`${CONTACT_MAILTO}?subject=Client%20Support`}
            className={cn(buttonVariants({ variant: "secondary", size: "md" }), "w-full")}
          >
            <span>Email support</span>
            <ArrowIcon direction="up-right" />
          </a>
        </div>
        <p className="border-t border-line pt-4 text-small text-ink-muted">
          Direct:{" "}
          <a
            href={CONTACT_MAILTO}
            className="break-words text-cobalt-700 underline decoration-cobalt-700/35 underline-offset-[0.22em] hover:decoration-cobalt-700"
          >
            {CONTACT_EMAIL}
          </a>
        </p>
      </div>
    </Panel>
  );
}
