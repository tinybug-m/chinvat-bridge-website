"use client";

import { useEffect } from "react";
import { Button } from "@/components/atoms/Button";
import { buttonClassName } from "@/components/atoms/buttonStyles";
import { EmailLink } from "@/components/atoms/EmailLink";
import { LegacyFrame } from "@/components/templates/LegacyFrame";
import { legacyBoundaryFontVariables } from "@/styles/legacy-fonts-boundary";
import { StatusPage } from "@/components/templates/StatusPage";

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <LegacyFrame fonts={legacyBoundaryFontVariables}>
      <StatusPage
        eyebrow="Something Went Wrong"
        title="Unexpected Error"
        description="Something didn't work as expected. You can try again, or reach out if the problem continues."
        contactNote={<EmailLink />}
        actions={
          <>
            <button type="button" onClick={() => retry()} className={buttonClassName("solid", "md")}>
              Try Again
            </button>
            <Button href="/" variant="outline" size="md">
              Back to Home
            </Button>
          </>
        }
      />
    </LegacyFrame>
  );
}
