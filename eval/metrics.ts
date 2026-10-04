/** Wilson score interval for a binomial proportion (95% default). */
export function wilsonInterval(successes: number, n: number, z = 1.96): { low: number; high: number; p: number } {
  if (n <= 0) return { low: 0, high: 0, p: 0 };
  const p = successes / n;
  const z2 = z * z;
  const denom = 1 + z2 / n;
  const center = (p + z2 / (2 * n)) / denom;
  const margin = (z * Math.sqrt((p * (1 - p)) / n + z2 / (4 * n * n))) / denom;
  return { p, low: Math.max(0, center - margin), high: Math.min(1, center + margin) };
}

export function formatPct(x: number): string {
  return `${(x * 100).toFixed(1)}%`;
}
