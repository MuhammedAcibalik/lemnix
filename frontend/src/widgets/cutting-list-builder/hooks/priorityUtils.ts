export type PrioritySelection = "1" | "2";

const HIGH_PRIORITY_VALUES = new Set(["2", "high", "urgent"]);

export const mapPriorityToSelection = (
  rawPriority?: string,
): PrioritySelection => {
  const normalized = rawPriority?.toLowerCase();
  return normalized && HIGH_PRIORITY_VALUES.has(normalized) ? "2" : "1";
};
