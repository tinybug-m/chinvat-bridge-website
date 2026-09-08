export interface InsightTopic {
  index: string;
  title: string;
  category: string;
  status: "Planned Briefing" | "Topic in Development";
}

export const INSIGHT_TOPICS: InsightTopic[] = [
  {
    index: "01",
    title: "Where AI Can Actually Save Your Business Time",
    category: "AI & Workflows",
    status: "Planned Briefing",
  },
  {
    index: "02",
    title: "What Should You Automate First?",
    category: "Process Automation",
    status: "Topic in Development",
  },
  {
    index: "03",
    title: "Why Your Website Isn't Bringing You Enough Customers",
    category: "SEO & Discovery",
    status: "Planned Briefing",
  },
  {
    index: "04",
    title: "When Should a Business Build Custom Software?",
    category: "Software Strategy",
    status: "Topic in Development",
  },
];
