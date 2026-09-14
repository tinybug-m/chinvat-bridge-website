"use client";

import Link from "next/link";
import { useActionState } from "react";
import { createCheckoutSession, type CheckoutFormState } from "@/actions/checkout";
import { Icon } from "@/components/atoms/icons";
import { SubmitButton } from "@/components/atoms/SubmitButton";
import { FormField } from "@/components/molecules/FormField";
import type { PlanId } from "@/data/pricing";

const COUNTRY_OPTIONS = [
  { value: "UK", label: "United Kingdom" },
  { value: "US", label: "United States" },
  { value: "EU", label: "European Union" },
  { value: "GLOBAL", label: "Global / Multi-National" },
];

const initialState: CheckoutFormState | null = null;

export function DetailsForm({ planId }: { planId: PlanId }) {
  const [state, formAction] = useActionState(createCheckoutSession, initialState);
  const values = state?.values;

  return (
    <div className="border border-stone-border bg-obsidian-900 rounded-sm p-6 md:p-10">
      <div className="border-b border-stone-border pb-6 mb-8">
        <span className="font-mono text-[10px] text-gold-500 uppercase tracking-technical block mb-2">
          &sect; 02.00 // Business Details
        </span>
        <h1 className="font-serif-monument text-3xl text-parchment-50 uppercase tracking-tight">
          Your Business Details
        </h1>
        <p className="font-serif-monument text-sm text-parchment-muted mt-2 max-w-2xl">
          Tell us about your business so we can configure your SEO engagement. This information is used
          only for onboarding and account correspondence.
        </p>
      </div>

      {state ? (
        <div
          role="alert"
          className="mb-6 p-4 border border-red-900/60 bg-red-950/20 font-serif-monument text-sm text-parchment-200"
        >
          {state.message}
        </div>
      ) : null}

      <form action={formAction} className="space-y-8">
        <input type="hidden" name="planId" value={planId} />

        <div className="space-y-5">
          <div className="border-b border-stone-border pb-2">
            <span className="font-mono text-[10px] text-gold-500 uppercase tracking-technical font-semibold">
              &sect; 01. Primary Contact (Required)
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField
              label="Full Name"
              name="fullName"
              required
              placeholder="e.g. Alex Sterling"
              defaultValue={values?.fullName}
            />
            <FormField
              label="Company Name"
              name="companyName"
              required
              placeholder="e.g. Sterling Industrial Ltd"
              defaultValue={values?.companyName}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField
              label="Business Email"
              name="email"
              type="email"
              required
              placeholder="alex@sterling.co.uk"
              defaultValue={values?.email}
            />
            <FormField
              label="Phone Number"
              name="phone"
              type="tel"
              required
              placeholder="+44 20 7946 0192"
              defaultValue={values?.phone}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
        </div>

        <div className="space-y-5">
          <div className="border-b border-stone-border pb-2">
            <span className="font-mono text-[10px] text-parchment-dim uppercase tracking-technical font-semibold">
              &sect; 02. Strategic Context (Optional)
            </span>
          </div>
          <FormField
            label="Target Market"
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
        </div>

        <div className="p-4 bg-obsidian-850 border-l-2 border-gold-500 flex gap-3 items-start">
          <Icon name="verified" className="text-gold-500 text-xl shrink-0 mt-0.5" />
          <p className="font-serif-monument text-sm text-parchment-muted leading-relaxed">
            <strong className="font-mono text-[10px] text-gold-500 tracking-technical uppercase block mb-1">
              Privacy Notice
            </strong>
            Your information is used only for onboarding and correspondence about your subscription. We
            never share or sell client data. By continuing, you agree to our{" "}
            <Link href="/terms" className="text-gold-300 hover:text-gold-400 underline underline-offset-2">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-gold-300 hover:text-gold-400 underline underline-offset-2">
              Privacy Policy
            </Link>
            .
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-parchment-dim font-mono text-[10px] uppercase tracking-technical">
            <Icon name="lock" className="text-sm" />
            <span>Secure, encrypted checkout</span>
          </div>
          <SubmitButton icon="arrowForward" size="lg" pendingLabel="Preparing checkout…">
            Continue to Secure Payment
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}
