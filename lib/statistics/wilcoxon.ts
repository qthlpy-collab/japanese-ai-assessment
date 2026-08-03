import { median } from './descriptive';

export interface WilcoxonResult {
  w: number;
  wPositive: number;
  wNegative: number;
  n: number;
  z: number;
  pValue: number;
  significant: boolean;
  direction: string;
  method: string;
}

function erf(x: number) {
  const sign = x >= 0 ? 1 : -1;
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  const t = 1 / (1 + p * Math.abs(x));
  const y = 1 - (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x));
  return sign * y;
}

export function normalCdf(x: number) {
  return 0.5 * (1 + erf(x / Math.sqrt(2)));
}

function averageRanks(absDiffs: number[]) {
  const sorted = absDiffs.map((value, index) => ({ value, index })).sort((a, b) => a.value - b.value);
  const ranks = new Array(absDiffs.length).fill(0);
  let i = 0;
  while (i < sorted.length) {
    let j = i;
    while (j + 1 < sorted.length && sorted[j + 1].value === sorted[i].value) j += 1;
    const rank = (i + 1 + j + 1) / 2;
    for (let k = i; k <= j; k += 1) ranks[sorted[k].index] = rank;
    i = j + 1;
  }
  return ranks;
}

export function wilcoxonSignedRank(pre: number[], post: number[], alpha = 0.05): WilcoxonResult {
  const pairs = pre
    .map((preValue, index) => ({ diff: post[index] - preValue }))
    .filter(({ diff }) => Number.isFinite(diff) && diff !== 0);
  const n = pairs.length;
  if (n === 0) {
    return {
      w: 0,
      wPositive: 0,
      wNegative: 0,
      n: 0,
      z: 0,
      pValue: 1,
      significant: false,
      direction: 'no non-zero paired differences',
      method: 'Normal approximation; zero differences removed'
    };
  }

  const ranks = averageRanks(pairs.map(({ diff }) => Math.abs(diff)));
  const wPositive = pairs.reduce((sum, pair, index) => sum + (pair.diff > 0 ? ranks[index] : 0), 0);
  const wNegative = pairs.reduce((sum, pair, index) => sum + (pair.diff < 0 ? ranks[index] : 0), 0);
  const w = Math.min(wPositive, wNegative);
  const expected = (n * (n + 1)) / 4;
  const variance = (n * (n + 1) * (2 * n + 1)) / 24;
  const z = variance === 0 ? 0 : (wPositive - expected) / Math.sqrt(variance);
  const pValue = Math.min(1, 2 * (1 - normalCdf(Math.abs(z))));
  const medianDiff = median(pairs.map(({ diff }) => diff)) ?? 0;

  return {
    w,
    wPositive,
    wNegative,
    n,
    z,
    pValue,
    significant: pValue < alpha,
    direction: medianDiff > 0 ? 'median increase' : medianDiff < 0 ? 'median decrease' : 'no median change',
    method: 'Normal approximation; zero differences removed; average ranks used for ties'
  };
}
