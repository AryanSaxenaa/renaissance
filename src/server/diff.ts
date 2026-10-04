import type { Fact, StatusReport } from '../shared/types.js';

export type FactDiffEntry =
  | { key: string; change: 'added'; fact: Fact }
  | { key: string; change: 'removed'; fact: Fact }
  | { key: string; change: 'changed'; before: Fact; after: Fact; delta?: number }
  | { key: string; change: 'alert'; message: string };

export function diffScans(
  a: { facts: Fact[]; statusReport?: StatusReport },
  b: { facts: Fact[]; statusReport?: StatusReport },
): FactDiffEntry[] {
  const out: FactDiffEntry[] = [];
  const mapA = new Map(a.facts.map((f) => [f.key, f]));
  const mapB = new Map(b.facts.map((f) => [f.key, f]));

  for (const [key, fact] of mapB) {
    if (!mapA.has(key)) out.push({ key, change: 'added', fact });
  }
  for (const [key, fact] of mapA) {
    if (!mapB.has(key)) out.push({ key, change: 'removed', fact });
  }
  for (const [key, after] of mapB) {
    const before = mapA.get(key);
    if (!before) continue;
    if (before.text !== after.text || before.value !== after.value) {
      let delta: number | undefined;
      if (typeof before.value === 'number' && typeof after.value === 'number') {
        delta = after.value - before.value;
      }
      out.push({ key, change: 'changed', before, after, delta });
    }
  }

  if (a.statusReport?.headline !== b.statusReport?.headline) {
    out.push({
      key: 'status.own.verdict',
      change: 'alert',
      message: `Status verdict changed from ${a.statusReport?.headline ?? 'unknown'} to ${b.statusReport?.headline ?? 'unknown'}`,
    });
  }
  return out;
}
