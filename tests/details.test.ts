import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parsePatentDetails } from '../src/server/patents/details.js';
import { computeStatusReport } from '../src/server/patents/status.js';

describe('parsePatentDetails (live SerpApi shape)', () => {
  it('parses year-keyed worldwide_applications and events for US1836693A', () => {
    const raw = JSON.parse(
      readFileSync(
        resolve('fixtures/replay/google_patents_details__714250765afc0fdb408b130d6f904208eb860790907b6449477fc89007160011.json'),
        'utf8',
      ),
    );
    const details = parsePatentDetails('patent/US1836693A/en', raw);
    expect(details.title).toBe('Windmill');
    expect(details.worldwide_applications?.length).toBeGreaterThanOrEqual(2);
    expect(details.worldwide_applications?.some((a) => a.this_app === true)).toBe(true);
    expect(details.legal_events?.length).toBeGreaterThan(0);

    const report = computeStatusReport({
      details,
      countryStatus: { US: 'NOT_ACTIVE', FR: 'NOT_ACTIVE' },
      now: new Date('2026-01-01'),
      evidence: [],
    });
    expect(report.headline).toBe('LIKELY_FREE');
    expect(report.confidence).toBe('HIGH');
    expect(report.ownOffice).toBe('US');
  });
});
