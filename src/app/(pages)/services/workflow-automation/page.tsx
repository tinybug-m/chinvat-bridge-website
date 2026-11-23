import type { Metadata } from "next";
import { ServicePage, serviceMetadata } from "@/components/services/ServicePage";

const PATH = "/services/workflow-automation";

export function generateMetadata(): Promise<Metadata> {
  return serviceMetadata(PATH);
}

export default function Page() {
  return <ServicePage path={PATH} />;
}
