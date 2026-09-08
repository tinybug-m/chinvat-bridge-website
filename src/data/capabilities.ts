export interface Capability {
  index: string;
  category: string;
  title: string;
  description: string;
}

export const CAPABILITIES: Capability[] = [
  {
    index: "01",
    category: "AI",
    title: "LLMs & Models",
    description: "Large language models, AI integrations, knowledge systems and intelligent workflows.",
  },
  {
    index: "02",
    category: "AUTOMATION",
    title: "Workflows & APIs",
    description: "Workflow automation, API integrations and business process orchestration.",
  },
  {
    index: "03",
    category: "SOFTWARE",
    title: "Custom Apps",
    description: "Modern web applications, internal tools and custom digital products.",
  },
  {
    index: "04",
    category: "DATA",
    title: "Pipelines & BI",
    description: "Data integration, structured information and actionable business intelligence.",
  },
  {
    index: "05",
    category: "WEB",
    title: "Digital Platforms",
    description: "Websites and digital experiences designed for performance, usability and growth.",
  },
  {
    index: "06",
    category: "SEO",
    title: "Technical SEO",
    description: "Technical SEO, site architecture, content structure and search visibility.",
  },
];
