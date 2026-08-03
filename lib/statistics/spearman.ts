import { mean, standardDeviation } from './descriptive';

function ranks(values: number[]) {
  const sorted = values.map((value, index) => ({ value, index })).sort((a, b) => a.value - b.value);
  const out = new Array(values.length).fill(0);
  let i = 0;
  while (i < sorted.length) {
    let j = i;
    while (j + 1 < sorted.length && sorted[j + 1].value === sorted[i].value) j += 1;
    const rank = (i + 1 + j + 1) / 2;
    for (let k = i; k <= j; k += 1) out[sorted[k].index] = rank;
    i = j + 1;
  }
  return out;
}

export function spearmanCorrelation(x: number[], y: number[]) {
  const pairs = x
    .map((value, index) => ({ x: value, y: y[index] }))
    .filter((pair) => Number.isFinite(pair.x) && Number.isFinite(pair.y));
  if (pairs.length < 2) return null;
  const rx = ranks(pairs.map((pair) => pair.x));
  const ry = ranks(pairs.map((pair) => pair.y));
  const mx = mean(rx) ?? 0;
  const my = mean(ry) ?? 0;
  const sx = standardDeviation(rx);
  const sy = standardDeviation(ry);
  if (sx === 0 || sy === 0) return null;
  const covariance = rx.reduce((sum, value, index) => sum + (value - mx) * (ry[index] - my), 0) / (rx.length - 1);
  return covariance / (sx * sy);
}
