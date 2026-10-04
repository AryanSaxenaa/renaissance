import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { computeStatusReport } from '../src/server/patents/status.js';
import { buildReplayDraftFromFacts } from '../src/server/brief/replayDraft.js';
import { verifyBrief } from '../src/server/brief/verify.js';
import { renderStatusLine } from '../src/server/brief/render.js';
import { assembleFacts } from '../src/server/brief/facts.js';
import { numbersIn, numeralsGroundedInFacts } from '../src/server/brief/grounding.js';
import { evalLabelSchema, engineSaysFree, humanSaysFree, humanSaysInForce, type EvalLabel } from './labels.js';
import { naiveExpiredByTerm } from './naive.js';
import { formatPct, wilsonInterval } from './metrics.js';

import { fileURLToPath, pathToFileURL } from 'node:url';
const ROOT = resolve(fileURLToPath(new URL('.', import.meta.url)), '..');

async function loadLabels(setName: string): Promise<EvalLabel[]> {
  const path =
    setName === 'tests-mini'
      ? join(ROOT, 'eval/fixtures/tests-mini.json')
      : join(ROOT, 'eval/labels', `${setName}.jsonl`);
  const raw = await readFile(path, 'utf8');
  if (setName === 'tests-mini') {
    const arr = JSON.parse(raw) as unknown[];
    return arr.map((row) => evalLabelSchema.parse(row));
  }
  return raw
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => evalLabelSchema.parse(JSON.parse(line)));
}

export async function runEval(setName: string): Promise<Record<string, unknown>> {
  const labels = await loadLabels(setName);
  let falseFree = 0;
  let falseFreeDenom = 0;
  let missFree = 0;
  let missDenom = 0;
  let uncertain = 0;
  let naiveDisagreeEngine = 0;
  const rows: Record<string, unknown>[] = [];

  for (const label of labels) {
    const now = label.now ? new Date(label.now) : new Date();
    const report = computeStatusReport({
      details: label.details,
      countryStatus: label.country_status,
      now,
    });
    const naiveFree = naiveExpiredByTerm(label.details, now);
    const engineFree = engineSaysFree(report.headline);

    if (engineFree) {
      falseFreeDenom += 1;
      if (humanSaysInForce(label.humanStatus)) falseFree += 1;
    }
    if (humanSaysFree(label.humanStatus)) {
      missDenom += 1;
      if (!engineFree) missFree += 1;
    }
    if (report.headline === 'UNCERTAIN' || report.headline === 'NOT_ENOUGH_DATA') uncertain += 1;
    if (naiveFree !== engineFree) naiveDisagreeEngine += 1;

    rows.push({
      id: label.id,
      patentId: label.patentId,
      humanStatus: label.humanStatus,
      engineHeadline: report.headline,
      engineConfidence: report.confidence,
      naiveExpiredByTerm: naiveFree,
    });
  }

  const ff = wilsonInterval(falseFree, falseFreeDenom);
  const miss = wilsonInterval(missFree, missDenom);

  let groundingViolations = 0;
  let groundingClaims = 0;
  for (const label of labels.slice(0, 3)) {
    const report = computeStatusReport({ details: label.details, now: label.now ? new Date(label.now) : new Date() });
    const source = {
      callId: 'eval',
      engine: 'synthetic',
      searchMetadataId: null,
      path: 'eval',
    };
    const facts = assembleFacts({
      statusReport: report,
      details: label.details,
      detailsSource: source,
      market: [],
      makers: [],
      papers: [],
      news: [],
    });
    const draft = buildReplayDraftFromFacts(facts);
    const brief = await verifyBrief(draft, facts, renderStatusLine(report));
    for (const section of [brief.summary, brief.mechanism, brief.marketReality, brief.risks]) {
      for (const c of section) {
        groundingClaims += 1;
        const cited = c.factIds.map((id) => facts.find((f) => f.id === id)!).filter(Boolean);
        if (!numeralsGroundedInFacts(c.text, cited)) groundingViolations += 1;
        for (const n of numbersIn(c.text)) {
          if (!cited.some((f) => `${f.text} ${f.value ?? ''}`.includes(n))) groundingViolations += 1;
        }
      }
    }
  }

  return {
    set: setName,
    n: labels.length,
    statusComparison: {
      falseFreeRate: { count: falseFree, denom: falseFreeDenom, ...ff, formatted: formatPct(ff.p) },
      falseFreeCi95: [ff.low, ff.high],
      missRate: { count: missFree, denom: missDenom, ...miss, formatted: formatPct(miss.p) },
      uncertaintyRate: uncertain / Math.max(1, labels.length),
      naiveVsEngineDisagreements: naiveDisagreeEngine,
      rows,
    },
    groundingAudit: {
      claimsChecked: groundingClaims,
      violations: groundingViolations,
    },
    generatedAt: new Date().toISOString(),
  };
}

async function main(): Promise<void> {
  const setArg = process.argv.find((a) => a.startsWith('--set='))?.split('=')[1] ?? 'tests-mini';
  const report = await runEval(setArg);
  const outPath = join(ROOT, 'eval/report.json');
  await mkdir(join(ROOT, 'eval'), { recursive: true });
  await writeFile(outPath, JSON.stringify(report, null, 2), 'utf8');
  const publicDir = join(ROOT, 'src/client/public/eval');
  await mkdir(publicDir, { recursive: true });
  await writeFile(join(publicDir, 'report.json'), JSON.stringify(report, null, 2), 'utf8');
  console.log(`Wrote ${outPath} (n=${report.n})`);
}

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isDirectRun) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
