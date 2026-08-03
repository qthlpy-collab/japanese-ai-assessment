export function wilcoxonEffectSize(z: number, n: number) {
  if (n <= 0) return 0;
  return Math.abs(z) / Math.sqrt(n);
}

export function interpretEffectSize(r: number) {
  if (r < 0.1) return 'negligible';
  if (r < 0.3) return 'small';
  if (r < 0.5) return 'medium';
  return 'large';
}
