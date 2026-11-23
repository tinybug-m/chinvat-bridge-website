import type { Metadata } from "next";
import { LegalPage, legalMetadata } from "@/components/content/LegalPage";

const PATH = "/terms";

export function generateMetadata(): Promise<Metadata> {
  return legalMetadata(PATH);
}

export default function Page() {
  return <LegalPage path={PATH} />;
}
