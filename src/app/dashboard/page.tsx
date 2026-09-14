import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SiteShell } from "@/components/templates/SiteShell";
import { Container } from "@/components/atoms/Container";
import { Bay } from "@/components/molecules/Bay";
import { ComingSoonNotice } from "@/components/molecules/ComingSoonNotice";
import { RealEngagementSummary } from "@/components/organisms/dashboard/RealEngagementSummary";
import { AdvisoryChannel } from "@/components/organisms/dashboard/AdvisoryChannel";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/actions/auth";

export const metadata: Metadata = {
  title: "Client Dashboard",
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: customer } = await supabase.from("customers").select("*").eq("id", user.id).maybeSingle();

  return (
    <SiteShell>
      <div className="bg-obsidian-950 py-12 lg:py-16">
        <Container className="space-y-8">
          <h1 className="sr-only">Client Dashboard</h1>
          <div className="flex justify-end">
            <form action={signOut}>
              <button
                type="submit"
                className="font-mono text-[10px] text-parchment-dim hover:text-gold-400 uppercase tracking-technical underline underline-offset-2"
              >
                Sign Out
              </button>
            </form>
          </div>

          {!customer ? (
            <Bay numeral="!" title="No Active Subscription">
              <ComingSoonNotice>
                We couldn&rsquo;t find an active subscription linked to your account.
              </ComingSoonNotice>
            </Bay>
          ) : (
            <>
              <RealEngagementSummary
                companyName={customer.company_name}
                website={customer.website}
                planId={customer.plan_id}
                status={customer.status}
              />
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8 space-y-8">
                  <Bay numeral="I." title="Project Progress">
                    <ComingSoonNotice>
                      Your consultant is setting up your account — progress tracking will appear here once
                      onboarding begins.
                    </ComingSoonNotice>
                  </Bay>
                </div>
                <div className="lg:col-span-4 space-y-8">
                  <Bay numeral="II." title="Reports &amp; Archive">
                    <ComingSoonNotice>Your first report will appear here once it&rsquo;s ready.</ComingSoonNotice>
                  </Bay>
                  <AdvisoryChannel />
                </div>
              </div>
            </>
          )}
        </Container>
      </div>
    </SiteShell>
  );
}
