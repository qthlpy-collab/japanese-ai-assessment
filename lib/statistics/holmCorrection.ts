export interface HolmResult {
  label: string;
  rawP: number;
  adjustedP: number;
  significantAfterHolm: boolean;
}

export function holmCorrection(results: { label: string; pValue: number }[], alpha = 0.05): HolmResult[] {
  const sorted = [...results].sort((a, b) => a.pValue - b.pValue);
  const adjusted = sorted.map((item, index) => ({
    label: item.label,
    rawP: item.pValue,
    adjustedP: Math.min(1, item.pValue * (sorted.length - index)),
    significantAfterHolm: false
  }));

  for (let i = 1; i < adjusted.length; i += 1) {
    adjusted[i].adjustedP = Math.max(adjusted[i].adjustedP, adjusted[i - 1].adjustedP);
  }

  adjusted.forEach((item) => {
    item.significantAfterHolm = item.adjustedP < alpha;
  });

  return results.map((item) => adjusted.find((adjustedItem) => adjustedItem.label === item.label)!);
}
