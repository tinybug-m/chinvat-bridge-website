import type { IconName } from "@/components/icons";

export interface Service {
  index: string;
  icon: IconName;
  title: string;
  strapline: string;
  description: string;
  tags: string[];
  outcome: string;
}

export const SERVICES: Service[] = [
  {
    index: "I.",
    icon: "neurology",
    title: "AI & Automation Integration",
    strapline: "AI That Serves the Business",
    description:
      "We help businesses identify practical AI opportunities, evaluate the right tools and models, and integrate AI into workflows where it creates measurable value.",
    tags: ["AI Strategy", "LLM Applications", "Automated Workflows", "Internal AI Tools"],
    outcome: "Practical Adoption",
  },
  {
    index: "II.",
    icon: "infinity",
    title: "Automation & Workflows",
    strapline: "Less Manual Work",
    description:
      "We design and build automated workflows that connect your tools, reduce repetitive tasks and help your team spend more time on higher-value work.",
    tags: ["Workflow Automation", "API Integrations", "Process Orchestration", "System-to-System"],
    outcome: "Reduce Manual Work",
  },
  {
    index: "III.",
    icon: "codeBlocks",
    title: "Software & Web",
    strapline: "Software Built Around You",
    description:
      "We build custom websites, web applications, internal tools and digital products around the way your business actually operates.",
    tags: ["Custom Web Apps", "Internal Tools", "Client Portals", "Dashboards & Systems"],
    outcome: "Built Around You",
  },
  {
    index: "IV.",
    icon: "trendingUp",
    title: "SEO & Digital Growth",
    strapline: "Be Found by the Right People",
    description:
      "We improve the technical foundations, structure and digital experience of your website so that search engines and customers can understand your business more clearly.",
    tags: ["Technical SEO", "Site Architecture", "Structured Data", "Performance Audits"],
    outcome: "Improve Visibility",
  },
];

export const SUPPORTING_CAPABILITIES = [
  "Digital Strategy",
  "Data Integration",
  "Analytics & BI",
  "Technical Architecture",
];
