export interface TransitionItem {
  label: string;
  status: string;
}

export const CURRENT_STATE_ITEMS: TransitionItem[] = [
  { label: "Repetitive manual work", status: "High human overhead" },
  { label: "Disconnected tools", status: "Fragmented data" },
  { label: "Poor search visibility", status: "Lost inbound demand" },
  { label: "Outdated processes", status: "Slow iteration speed" },
  { label: "Too much operational friction", status: "Compounding cost" },
];

export const FUTURE_STATE_ITEMS: TransitionItem[] = [
  { label: "Automated workflows", status: "Reliable & fast" },
  { label: "Connected systems", status: "Single source of truth" },
  { label: "Stronger organic visibility", status: "Consistent inbound trust" },
  { label: "Better digital experiences", status: "Clear conversion" },
  { label: "Software built around the business", status: "Enduring advantage" },
];
