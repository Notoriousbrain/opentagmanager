export const RANGE_LABELS: Record<"7d" | "14d" | "30d", string> = {
  "7d": "Last 7 Days",
  "14d": "Last 14 Days",
  "30d": "Last 30 Days",
};

export function rangeToLabel(range: "7d" | "14d" | "30d") {
  return RANGE_LABELS[range] ?? "Last 14 Days";
}
