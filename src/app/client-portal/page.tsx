import type { Metadata } from "next";
import { SiteShell } from "@/components/templates/SiteShell";
import { Container } from "@/components/atoms/Container";
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
      <div className="bg-obsidian-950 py-12 lg:py-16">
        <Container className="space-y-8">
          <EngagementSummary />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-8">
              <DeliverableProgress />
              <SprintLog />
            </div>
            <div className="lg:col-span-4 space-y-8">
              <ReportsArchive />
              <AdvisoryChannel />
            </div>
          </div>
        </Container>
      </div>
    </SiteShell>
  );
}
