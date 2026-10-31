"use client";

import { useEffect } from "react";
import { EmailLink } from "@/components/atoms/EmailLink";
import { BodyFontScope } from "@/components/site/BodyFontScope";
import { Button, ButtonLink } from "@/components/system/Button";
import { SiteShell } from "@/components/templates/SiteShell";
import { StatusPage } from "@/components/templates/StatusPage";
import { archivo, martianMono } from "@/styles/fonts";

const FONT_VARIABLES = `${archivo.variable} ${martianMono.variable}`;

/*
 * The app-level error boundary sits outside both route groups, so like the
 * 404 it brings the new fonts itself and renders inside the site header and
 * footer (templates/SiteShell clears the fixed header).
 */
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
    <div className={`${FONT_VARIABLES} contents font-body`}>
      <BodyFontScope className={FONT_VARIABLES} />
      <SiteShell>
        <StatusPage
          bare
          eyebrow="Something went wrong"
          title="Unexpected error"
          description="Something didn’t work as expected. You can try again, or reach out if the problem continues."
          contactNote={<EmailLink />}
          actions={
            <>
              <Button onClick={() => retry()} size="lg" className="w-full sm:w-auto">
                Try again
              </Button>
              <ButtonLink href="/" variant="secondary" size="lg" className="w-full sm:w-auto">
                Back to home
              </ButtonLink>
            </>
          }
        />
      </SiteShell>
    </div>
  );
}
