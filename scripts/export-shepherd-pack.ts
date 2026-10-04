import { mkdir, writeFile } from 'node:fs/promises';
import request from 'supertest';
import { createApp } from '../src/server/app.js';
import { loadConfig, resetConfigForTests } from '../src/server/config.js';

process.env.NODE_ENV = 'test';
process.env.RENAISSANCE_MODE = 'replay';
delete process.env.SERPAPI_API_KEY;
resetConfigForTests();
loadConfig(process.env);

const app = createApp();
const agent = request.agent(app);
const q = 'centrifugal governor';
const search = await agent.get('/api/v1/search').query({ q });
const hit = search.body.hits[0] as { patent_id: string; title: string };
const created = await agent.post('/api/v1/scans').send({
  patentId: hit.patent_id,
  query: q,
  city: 'Pune',
  title: hit.title,
});
let scanBody: unknown;
for (let i = 0; i < 40; i++) {
  await new Promise((r) => setTimeout(r, 200));
  const scan = await agent.get(`/api/v1/scans/${created.body.scanId}`);
  scanBody = scan.body;
  if (scan.body.status === 'complete') break;
}
await mkdir('src/client/public/demo', { recursive: true });
const pack = {
  query: q,
  city: 'Pune',
  search: { hits: search.body.hits.slice(0, 5), receipt: search.body.receipt },
  scan: scanBody,
  featuredPatentId: hit.patent_id,
  demoScanId: 'shepherd-demo',
};
await writeFile('src/client/public/demo/shepherd-pack.json', JSON.stringify(pack, null, 2));
console.log('exported', (scanBody as { status: string }).status);
