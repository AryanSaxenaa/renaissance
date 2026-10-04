import { describe, expect, it } from 'vitest';
import { runEval } from '../eval/run.js';
import { wilsonInterval } from '../eval/metrics.js';

describe('eval harness', () => {
  it('tests-mini produces report offline', async () => {
    const report = await runEval('tests-mini');
    expect(report.n).toBe(5);
    expect(report.statusComparison).toBeDefined();
    expect((report.groundingAudit as { violations: number }).violations).toBe(0);
  });

  it('wilson interval bounds probability', () => {
    const w = wilsonInterval(2, 10);
    expect(w.low).toBeLessThanOrEqual(w.p);
    expect(w.high).toBeGreaterThanOrEqual(w.p);
  });
});
