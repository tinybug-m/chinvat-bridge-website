import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SiteShell } from "@/components/templates/SiteShell";
import { Container } from "@/components/system/Container";
import { PageHeader } from "@/components/system/PageHeader";
import { Button } from "@/components/system/Button";
import { Panel } from "@/components/portal/Panel";
import { ComingSoonNotice } from "@/components/molecules/ComingSoonNotice";
import { RealEngagementSummary } from "@/components/organisms/dashboard/RealEngagementSummary";
import { RealProjectProgress } from "@/components/organisms/dashboard/RealProjectProgress";
import { RealSprintLog } from "@/components/organisms/dashboard/RealSprintLog";
import { RealUpdatesArchive } from "@/components/organisms/dashboard/RealUpdatesArchive";
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
      <PageHeader
        kicker="Client dashboard"
        title="Your engagement"
        aside={
          <form action={signOut} className="lg:flex lg:justify-end">
            <Button type="submit" variant="secondary">
              Sign out
            </Button>
          </form>
        }
        compact
      />
      <Container className="space-y-6 pt-10 pb-section lg:space-y-8 lg:pt-14">
        {!customer ? (
          <Panel title="No active subscription">
            <ComingSoonNotice>
              We couldn&rsquo;t find an active subscription linked to your account.
            </ComingSoonNotice>
          </Panel>
        ) : (
          <>
            <RealEngagementSummary
              companyName={customer.company_name}
              website={customer.website}
              planId={customer.plan_id}
              status={customer.status}
              nextBillingDate={customer.next_billing_date}
              practiceLead={customer.practice_lead}
            />
            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-8">
              <div className="space-y-6 lg:col-span-8 lg:space-y-8">
                <RealProjectProgress customerId={customer.id} planId={customer.plan_id} />
                <RealSprintLog customerId={customer.id} />
              </div>
              <div className="space-y-6 lg:col-span-4 lg:space-y-8">
                <RealUpdatesArchive customerId={customer.id} />
                <AdvisoryChannel />
              </div>
            </div>
          </>
        )}
      </Container>
    </SiteShell>
  );
}
