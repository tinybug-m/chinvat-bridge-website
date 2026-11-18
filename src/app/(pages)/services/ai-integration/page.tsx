import type { Metadata } from "next";
import { ServicePage, serviceMetadata } from "@/components/services/ServicePage";
import { AI_SERVICE } from "@/data/service-pages";

export const metadata: Metadata = serviceMetadata(AI_SERVICE);

export default function AiIntegrationPage() {
  return <ServicePage content={AI_SERVICE} />;
}
