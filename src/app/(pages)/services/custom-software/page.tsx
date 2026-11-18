import type { Metadata } from "next";
import { ServicePage, serviceMetadata } from "@/components/services/ServicePage";
import { SOFTWARE_SERVICE } from "@/data/service-pages";

export const metadata: Metadata = serviceMetadata(SOFTWARE_SERVICE);

export default function CustomSoftwarePage() {
  return <ServicePage content={SOFTWARE_SERVICE} />;
}
