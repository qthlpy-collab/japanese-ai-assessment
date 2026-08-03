export function clean(values: Array<number | null | undefined>) {
  return values.filter((value): value is number => typeof value === 'number' && Number.isFinite(value));
}

export function mean(values: Array<number | null | undefined>) {
  const xs = clean(values);
  if (xs.length === 0) return null;
  return xs.reduce((sum, value) => sum + value, 0) / xs.length;
}

export function median(values: Array<number | null | undefined>) {
  const xs = clean(values).sort((a, b) => a - b);
  if (xs.length === 0) return null;
  const mid = Math.floor(xs.length / 2);
  return xs.length % 2 === 0 ? (xs[mid - 1] + xs[mid]) / 2 : xs[mid];
}

export function standardDeviation(values: Array<number | null | undefined>) {
  const xs = clean(values);
  if (xs.length < 2) return 0;
  const avg = mean(xs) ?? 0;
  const variance = xs.reduce((sum, value) => sum + (value - avg) ** 2, 0) / (xs.length - 1);
  return Math.sqrt(variance);
}

export function quantile(values: Array<number | null | undefined>, q: number) {
  const xs = clean(values).sort((a, b) => a - b);
  if (xs.length === 0) return null;
  if (xs.length === 1) return xs[0];
  const pos = (xs.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  return xs[base + 1] === undefined ? xs[base] : xs[base] + rest * (xs[base + 1] - xs[base]);
}

export function iqr(values: Array<number | null | undefined>) {
  const q1 = quantile(values, 0.25);
  const q3 = quantile(values, 0.75);
  return q1 === null || q3 === null ? null : q3 - q1;
}

export function min(values: Array<number | null | undefined>) {
  const xs = clean(values);
  return xs.length ? Math.min(...xs) : null;
}

export function max(values: Array<number | null | undefined>) {
  const xs = clean(values);
  return xs.length ? Math.max(...xs) : null;
}

export function describe(values: Array<number | null | undefined>) {
  const xs = clean(values);
  return {
    n: xs.length,
    mean: mean(xs),
    median: median(xs),
    sd: standardDeviation(xs),
    min: min(xs),
    max: max(xs),
    iqr: iqr(xs)
  };
}

export function gain(post: number, pre: number) {
  return post - pre;
}

export function gainCategory(value: number) {
  if (value > 0) return 'Improved';
  if (value < 0) return 'Declined';
  return 'No Change';
}

export function retentionRate(delayed: number, post: number) {
  if (post === 0) return null;
  return (delayed / post) * 100;
}

export function percentageChange(post: number, pre: number) {
  if (pre === 0) return null;
  return ((post - pre) / pre) * 100;
}

export function round(value: number | null | undefined, digits = 2) {
  if (value === null || value === undefined || !Number.isFinite(value)) return null;
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}
