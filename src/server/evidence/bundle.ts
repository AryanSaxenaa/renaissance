import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { DesignBrief, Fact, StatusReport } from '../../shared/types.js';
import type { SerpReceipt } from '../serpapi/types.js';
import { redactResponse } from '../serpapi/redact.js';

export type EvidenceManifest = {
  schema: 'renaissance.evidence/1';
  projectId: string;
  scanId: string;
  mode: string;
  creditsSpent: number;
  files: { path: string; sha256: string }[];
};

export async function buildEvidenceBundle(input: {
  outDir: string;
  projectId: string;
  scanId: string;
  mode: string;
  statusReport: StatusReport;
  facts: Fact[];
  brief: DesignBrief;
  receipts: SerpReceipt[];
  rawBodies: Record<string, unknown>;
}): Promise<EvidenceManifest> {
  await mkdir(input.outDir, { recursive: true });
  const files: { path: string; sha256: string }[] = [];

  async function writeJson(name: string, data: unknown): Promise<void> {
    const content = JSON.stringify(data, null, 2);
    const sha256 = createHash('sha256').update(content).digest('hex');
    await writeFile(join(input.outDir, name), content, 'utf8');
    files.push({ path: name, sha256 });
  }

  const creditsSpent = input.receipts.reduce((s, r) => s + r.credits, 0);

  await writeJson('status.json', input.statusReport);
  await writeJson('facts.json', input.facts);
  await writeJson('brief.json', input.brief);
  await writeJson('ledger.jsonl', input.receipts);

  for (const [callId, body] of Object.entries(input.rawBodies)) {
    await writeJson(join('serpapi', `${callId}.json`), redactResponse(body as import('../serpapi/types.js').SerpResponse));
  }

  const manifest: EvidenceManifest = {
    schema: 'renaissance.evidence/1',
    projectId: input.projectId,
    scanId: input.scanId,
    mode: input.mode,
    creditsSpent,
    files,
  };
  await writeJson('manifest.json', manifest);
  await writeFile(
    join(input.outDir, 'README.txt'),
    'Renaissance evidence bundle. Run scripts/verify-bundle.mjs on this folder.',
    'utf8',
  );
  return manifest;
}
