export interface Capability {
  category: string;
  title: string;
  description: string;
}

export const CAPABILITIES: Capability[] = [
  {
    category: "AI",
    title: "LLMs & Models",
    description: "Large language models, AI integrations, knowledge systems and intelligent workflows.",
  },
  {
    category: "Automation",
    title: "Workflows & APIs",
    description: "Workflow automation, API integrations and business process orchestration.",
  },
  {
    category: "Software",
    title: "Custom Apps",
    description: "Modern web applications, internal tools and custom digital products.",
  },
  {
    category: "Data",
    title: "Pipelines & BI",
    description: "Data integration, structured information and actionable business intelligence.",
  },
  {
    category: "Web",
    title: "Digital Platforms",
    description: "Websites and digital experiences designed for performance, usability and growth.",
  },
  {
    category: "SEO",
    title: "Technical SEO",
    description: "Technical SEO, site architecture, content structure and search visibility.",
  },
];
