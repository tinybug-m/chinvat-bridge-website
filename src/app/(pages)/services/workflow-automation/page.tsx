import type { Metadata } from "next";
import { ServicePage, serviceMetadata } from "@/components/services/ServicePage";
import { AUTOMATION_SERVICE } from "@/data/service-pages";

export const metadata: Metadata = serviceMetadata(AUTOMATION_SERVICE);

export default function WorkflowAutomationPage() {
  return <ServicePage content={AUTOMATION_SERVICE} />;
}
