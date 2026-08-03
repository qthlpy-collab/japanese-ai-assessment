import { describe, expect, it } from 'vitest';
import { describe as describeStats, gain, iqr, mean, median, retentionRate, standardDeviation } from '../lib/statistics/descriptive';
import { wilcoxonSignedRank } from '../lib/statistics/wilcoxon';
import { wilcoxonEffectSize } from '../lib/statistics/effectSize';
import { holmCorrection } from '../lib/statistics/holmCorrection';
import { spearmanCorrelation } from '../lib/statistics/spearman';

describe('descriptive statistics', () => {
  it('calculates mean, median, standard deviation and IQR', () => {
    const values = [1, 2, 3, 4, 5];
    expect(mean(values)).toBe(3);
    expect(median(values)).toBe(3);
    expect(Number(standardDeviation(values).toFixed(3))).toBe(1.581);
    expect(iqr(values)).toBe(2);
    expect(describeStats(values).n).toBe(5);
  });

  it('calculates gain and avoids retention division by zero', () => {
    expect(gain(75, 60)).toBe(15);
    expect(retentionRate(50, 0)).toBeNull();
    expect(retentionRate(80, 100)).toBe(80);
  });

  it('ignores missing values in descriptive statistics', () => {
    expect(mean([1, null, undefined, 3])).toBe(2);
  });
});

describe('wilcoxon signed-rank test', () => {
  it('handles positive paired differences', () => {
    const result = wilcoxonSignedRank([1, 2, 3, 4], [2, 3, 4, 5]);
    expect(result.n).toBe(4);
    expect(result.wPositive).toBe(10);
    expect(result.wNegative).toBe(0);
    expect(result.pValue).toBeLessThanOrEqual(1);
  });

  it('removes zero differences', () => {
    const result = wilcoxonSignedRank([1, 2, 3], [1, 4, 5]);
    expect(result.n).toBe(2);
  });

  it('calculates effect size', () => {
    expect(wilcoxonEffectSize(2, 4)).toBe(1);
  });
});

describe('multiple comparison and correlation helpers', () => {
  it('applies Holm correction monotonically', () => {
    const adjusted = holmCorrection([
      { label: 'a', pValue: 0.01 },
      { label: 'b', pValue: 0.03 },
      { label: 'c', pValue: 0.2 }
    ]);
    expect(adjusted.find((item) => item.label === 'a')?.adjustedP).toBeCloseTo(0.03);
    expect(adjusted.find((item) => item.label === 'c')?.adjustedP).toBeCloseTo(0.2);
  });

  it('calculates Spearman rank correlation', () => {
    expect(spearmanCorrelation([1, 2, 3], [1, 2, 3])).toBeCloseTo(1);
    expect(spearmanCorrelation([1, 2, 3], [3, 2, 1])).toBeCloseTo(-1);
  });
});
