export interface TransitionItem {
  label: string;
  status: string;
}

export const CURRENT_STATE_ITEMS: TransitionItem[] = [
  { label: "Repetitive manual work", status: "High Human Overhead" },
  { label: "Disconnected tools", status: "Fragmented Data" },
  { label: "Poor search visibility", status: "Lost Inbound Demand" },
  { label: "Outdated processes", status: "Slow Iteration Speed" },
  { label: "Too much operational friction", status: "Compounding Cost" },
];

export const FUTURE_STATE_ITEMS: TransitionItem[] = [
  { label: "Automated workflows", status: "Reliable & Fast" },
  { label: "Connected systems", status: "Single Source of Truth" },
  { label: "Stronger organic visibility", status: "Consistent Inbound Trust" },
  { label: "Better digital experiences", status: "Clear Conversion" },
  { label: "Software built around the business", status: "Enduring Advantage" },
];
