import type { Metadata } from "next";
import { SiteShell } from "@/components/templates/SiteShell";
import { Chip } from "@/components/atoms/Chip";
import { Container } from "@/components/system/Container";
import { PageHeader } from "@/components/system/PageHeader";
import { PreviewBanner } from "@/components/organisms/dashboard/PreviewBanner";
import { EngagementSummary } from "@/components/organisms/dashboard/EngagementSummary";
import { DeliverableProgress } from "@/components/organisms/dashboard/DeliverableProgress";
import { SprintLog } from "@/components/organisms/dashboard/SprintLog";
import { ReportsArchive } from "@/components/organisms/dashboard/ReportsArchive";
import { AdvisoryChannel } from "@/components/organisms/dashboard/AdvisoryChannel";

export const metadata: Metadata = {
  title: "Client Portal Preview",
  description: "A preview of the Chinvat Bridge client portal — illustrative example, not real project data.",
  robots: { index: false, follow: false },
};

export default function ClientPortalPreviewPage() {
  return (
    <SiteShell>
      <PreviewBanner />
      <PageHeader
        kicker="Client workspace — example preview"
        title="Client engagement portal"
        compact
      >
        <Chip emphasized>Example data</Chip>
      </PageHeader>
      <Container className="space-y-6 pt-10 pb-section lg:space-y-8 lg:pt-14">
        <EngagementSummary />
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-8">
          <div className="space-y-6 lg:col-span-8 lg:space-y-8">
            <DeliverableProgress />
            <SprintLog />
          </div>
          <div className="space-y-6 lg:col-span-4 lg:space-y-8">
            <ReportsArchive />
            <AdvisoryChannel />
          </div>
        </div>
      </Container>
    </SiteShell>
  );
}
