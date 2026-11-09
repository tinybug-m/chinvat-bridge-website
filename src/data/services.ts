import type { IconName } from "@/components/atoms/icons";

export interface Service {
  index: string;
  icon: IconName;
  title: string;
  strapline: string;
  description: string;
  tags: string[];
  outcome: string;
  href?: string;
}

export const SERVICES: Service[] = [
  {
    index: "I.",
    icon: "neurology",
    title: "AI & Automation Integration",
    strapline: "AI that serves the business",
    description:
      "We help businesses identify practical AI opportunities, evaluate the right tools and models, and integrate AI into workflows where it creates measurable value.",
    tags: ["AI strategy", "LLM applications", "Automated workflows", "Internal AI tools"],
    outcome: "Practical adoption",
    href: "/insights/where-ai-can-save-your-business-time",
  },
  {
    index: "II.",
    icon: "infinity",
    title: "Automation & Workflows",
    strapline: "Less manual work",
    description:
      "We design and build automated workflows that connect your tools, reduce repetitive tasks and help your team spend more time on higher-value work.",
    tags: ["Workflow automation", "API integrations", "Process orchestration", "System-to-system"],
    outcome: "Reduce manual work",
    href: "/insights/what-should-you-automate-first",
  },
  {
    index: "III.",
    icon: "codeBlocks",
    title: "Software & Web",
    strapline: "Software built around you",
    description:
      "We build custom websites, web applications, internal tools and digital products around the way your business actually operates.",
    tags: ["Custom web apps", "Internal tools", "Client portals", "Dashboards & systems"],
    outcome: "Built around you",
    href: "/insights/when-should-a-business-build-custom-software",
  },
  {
    index: "IV.",
    icon: "trendingUp",
    title: "SEO & Digital Growth",
    strapline: "Be found by the right people",
    description:
      "We improve the technical foundations, structure and digital experience of your website so that search engines and customers can understand your business more clearly.",
    tags: ["Technical SEO", "Site architecture", "Structured data", "Performance audits"],
    outcome: "Improve visibility",
    href: "/services/seo",
  },
];

export const SUPPORTING_CAPABILITIES = [
  "Digital Strategy",
  "Data Integration",
  "Analytics & BI",
  "Technical Architecture",
];
