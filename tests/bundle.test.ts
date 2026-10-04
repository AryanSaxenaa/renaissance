import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { describe, expect, it } from 'vitest';
import { buildEvidenceBundle } from '../src/server/evidence/bundle.js';
import { computeStatusReport } from '../src/server/patents/status.js';

describe('evidence bundle', () => {
  it('builds manifest that verify script accepts', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'renaissance-bundle-'));
    try {
      const details = {
        patent_id: 'SYN',
        filing_date: '1970-01-01',
        worldwide_applications: [
          {
            country_code: 'US',
            application_number: '1',
            filing_date: '1970-01-01',
            legal_status_cat: 'not active',
            this_app: true,
          },
        ],
        legal_events: [{ code: 'EXP', title: 'Expired', date: '1995-01-01' }],
      };
      const statusReport = computeStatusReport({ details, now: new Date('2026-01-01') });
      const manifest = await buildEvidenceBundle({
        outDir: dir,
        projectId: 'p1',
        scanId: 's1',
        mode: 'replay',
        statusReport,
        facts: [],
        brief: {
          schema: 'design_brief/1',
          summary: [],
          mechanism: [],
          marketReality: [],
          suggestions: [],
          risks: [],
          nextSteps: [],
          statusLine: 'test',
          removedByVerifier: 0,
        },
        receipts: [],
        rawBodies: {},
      });
      expect(manifest.schema).toBe('renaissance.evidence/1');
      const onDisk = JSON.parse(await readFile(join(dir, 'manifest.json'), 'utf8'));
      expect(onDisk.files.length).toBeGreaterThan(0);

      await writeFile(join(dir, 'manifest.json'), '{"files":[]}');
      const tampered = JSON.parse(await readFile(join(dir, 'manifest.json'), 'utf8'));
      expect(tampered.files).toHaveLength(0);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
