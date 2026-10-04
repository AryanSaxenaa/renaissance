import { readFile, mkdir, writeFile } from 'node:fs/promises';
import request from 'supertest';
import { createApp } from '../src/server/app.js';
import { loadConfig, resetConfigForTests } from '../src/server/config.js';

/** Curated replay patent with rich fixtures (US4085846), not first search hit. */
const FEATURED_PATENT_ID = 'US-US4085846-A';
const FEATURED_TITLE = 'Speed control system for a centrifugal governor';
const QUERY = 'centrifugal governor';
const CITY = 'Pune';

process.env.NODE_ENV = 'test';
process.env.RENAISSANCE_MODE = 'replay';
delete process.env.SERPAPI_API_KEY;
resetConfigForTests();
loadConfig(process.env);

const app = createApp();
const agent = request.agent(app);

const searchFixture = JSON.parse(
  await readFile('fixtures/replay/google_patents__720abb4c17007ab335364ad2e2e3815525db58ed16a79f4e09f573da8c3ee486.json', 'utf8'),
) as {
  search_metadata: { id: string };
  organic_results: Array<Record<string, unknown>>;
};

const created = await agent.post('/api/v1/scans').send({
  patentId: FEATURED_PATENT_ID,
  query: QUERY,
  city: CITY,
  title: FEATURED_TITLE,
});

let scanBody: Record<string, unknown> | undefined;
for (let i = 0; i < 40; i++) {
  await new Promise((r) => setTimeout(r, 200));
  const scan = await agent.get(`/api/v1/scans/${created.body.scanId}`);
  scanBody = scan.body as Record<string, unknown>;
  if (scan.body.status === 'complete') break;
}

if (!scanBody || scanBody.status !== 'complete') {
  throw new Error('shepherd_export_scan_incomplete');
}

const statusReport = scanBody.statusReport as { headline?: string; ownOffice?: string } | undefined;
if (statusReport?.headline === 'NOT_ENOUGH_DATA') {
  throw new Error('shepherd_export_weak_status');
}

const hits = searchFixture.organic_results.map((row) => ({
  patent_id: String(row.patent_id),
  title: String(row.title),
  publication_date: row.publication_date as string | undefined,
  filing_date: row.filing_date as string | undefined,
  country_status: row.country_status as Record<string, string> | undefined,
  snippet: row.snippet as string | undefined,
}));

await mkdir('src/client/public/demo', { recursive: true });
const pack = {
  query: QUERY,
  city: CITY,
  search: {
    hits,
    receipt: { callId: 'shepherd-search-replay', searchMetadataId: searchFixture.search_metadata.id },
  },
  scan: scanBody,
  featuredPatentId: FEATURED_PATENT_ID,
  demoScanId: 'shepherd-demo',
};
await writeFile('src/client/public/demo/shepherd-pack.json', JSON.stringify(pack, null, 2));
console.log(
  'exported',
  statusReport?.headline,
  statusReport?.ownOffice,
  'facts',
  (scanBody.facts as unknown[])?.length,
);
