export interface ProcessStep {
  index: string;
  title: string;
  description: string;
}

export const PROCESS_STEPS: ProcessStep[] = [
  {
    index: "I.",
    title: "Discover",
    description: "We understand your business, your existing systems and the problems worth solving.",
  },
  {
    index: "II.",
    title: "Define",
    description: "We identify the highest-impact opportunities and define a practical path forward.",
  },
  {
    index: "III.",
    title: "Build",
    description: "We design, develop and integrate the solution with care and engineering rigor.",
  },
  {
    index: "IV.",
    title: "Improve",
    description: "We measure what works, refine the system and help you build on it sustainably.",
  },
];
