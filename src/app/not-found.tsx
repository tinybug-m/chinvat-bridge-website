import type { Metadata } from "next";
import { SiteShell } from "@/components/templates/SiteShell";
import { StatusPage } from "@/components/templates/StatusPage";
import { Button } from "@/components/atoms/Button";
import { EmailLink } from "@/components/atoms/EmailLink";

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <SiteShell>
      <StatusPage
        bare
        eyebrow="404"
        title="That Page Doesn't Exist."
        description="The page you're looking for may have moved, or the link may be out of date. Here are some places to go instead."
        contactNote={
          <>
            Still stuck? <EmailLink />
          </>
        }
        actions={
          <>
            <Button href="/" size="md">
              Back to Home
            </Button>
            <Button href="/pricing" variant="outline" size="md">
              View Plans
            </Button>
            <Button href="/insights" variant="outline" size="md">
              Read Insights
            </Button>
          </>
        }
      />
    </SiteShell>
  );
}
