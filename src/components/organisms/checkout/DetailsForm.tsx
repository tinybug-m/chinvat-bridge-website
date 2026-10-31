"use client";

import { useActionState } from "react";
import { createCheckoutSession, type CheckoutFormState } from "@/actions/checkout";
import { Icon } from "@/components/atoms/icons";
import { SubmitButton } from "@/components/atoms/SubmitButton";
import { FormField } from "@/components/molecules/FormField";
import { TextLink } from "@/components/system/TextLink";
import type { PlanId } from "@/data/pricing";

const COUNTRY_OPTIONS = [
  { value: "UK", label: "United Kingdom" },
  { value: "US", label: "United States" },
  { value: "EU", label: "European Union" },
  { value: "GLOBAL", label: "Global / Multi-National" },
];

const initialState: CheckoutFormState | null = null;

function GroupLegend({ title, note }: { title: string; note: string }) {
  return (
    <legend className="flex w-full items-baseline justify-between gap-4 border-b border-line pb-3 text-small">
      <span className="font-medium text-ink">{title}</span>
      <span className="text-ink-muted">{note}</span>
    </legend>
  );
}

export function DetailsForm({ planId }: { planId: PlanId }) {
  const [state, formAction] = useActionState(createCheckoutSession, initialState);
  const values = state?.values;

  return (
    <div>
      <header>
        <p className="text-small font-medium text-ink-muted">Business details</p>
        <h1 className="mt-4 font-display text-title font-medium text-balance text-ink [font-stretch:100%] lg:[font-stretch:112%]">
          Your business details
        </h1>
        <p className="mt-6 max-w-[36rem] text-lede text-pretty text-ink-soft">
          Tell us about your business so we can configure your SEO engagement. This information is used only for
          onboarding and account correspondence.
        </p>
      </header>

      {state ? (
        <div
          role="alert"
          className="mt-10 border-l-2 border-signal-error bg-paper-raised py-3 pr-4 pl-4 text-small text-ink"
        >
          {state.message}
        </div>
      ) : null}

      <form action={formAction} className="mt-12 space-y-12">
        <input type="hidden" name="planId" value={planId} />

        <fieldset className="space-y-6">
          <GroupLegend title="Primary contact" note="Required" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              label="Full name"
              name="fullName"
              required
              placeholder="e.g. Alex Sterling"
              defaultValue={values?.fullName}
            />
            <FormField
              label="Company name"
              name="companyName"
              required
              placeholder="e.g. Sterling Industrial Ltd"
              defaultValue={values?.companyName}
            />
            <FormField
              label="Business email"
              name="email"
              type="email"
              required
              placeholder="alex@sterling.co.uk"
              defaultValue={values?.email}
            />
            <FormField
              label="Phone number"
              name="phone"
              type="tel"
              required
              placeholder="+44 20 7946 0192"
              defaultValue={values?.phone}
            />
            <FormField
              label="Website URL"
              name="website"
              type="url"
              required
              placeholder="https://sterling.co.uk"
              defaultValue={values?.website}
            />
            <FormField
              label="Country"
              name="country"
              type="select"
              options={COUNTRY_OPTIONS}
              defaultValue={values?.country ?? "UK"}
            />
          </div>
        </fieldset>

        <fieldset className="space-y-6">
          <GroupLegend title="Strategic context" note="Optional" />
          <FormField
            label="Target market"
            name="targetMarket"
            placeholder="e.g. UK National, London & South East"
            defaultValue={values?.targetMarket}
          />
          <FormField
            label="What would you like to improve?"
            name="improvements"
            type="textarea"
            placeholder="e.g. Site speed, ranking for core commercial terms, fixing crawl errors..."
            defaultValue={values?.improvements}
          />
        </fieldset>

        <div className="border-t border-line pt-6">
          <p className="max-w-[40rem] text-small text-pretty text-ink-soft">
            <strong className="mb-1 block font-medium text-ink">Privacy notice</strong>
            Your information is used only for onboarding and correspondence about your subscription. We never share
            or sell client data. By continuing, you agree to our <TextLink href="/terms">Terms of Service</TextLink>{" "}
            and <TextLink href="/privacy">Privacy Policy</TextLink>.
          </p>

          <div className="mt-8 flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-2 text-small text-ink-muted">
              <Icon name="lock" className="shrink-0 text-base" />
              <span>Secure, encrypted checkout</span>
            </p>
            <SubmitButton arrow="right" size="lg" pendingLabel="Preparing checkout…" className="w-full sm:w-auto">
              Continue to secure payment
            </SubmitButton>
          </div>
        </div>
      </form>
    </div>
  );
}
