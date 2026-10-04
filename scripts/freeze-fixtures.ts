/**
 * Record live SerpApi responses into fixtures/replay/ (redacted, no api_key).
 * Usage: set SERPAPI_API_KEY in .env.local, then npm run fixtures:freeze -- "query" [--minimal]
 */
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { resetConfigForTests, loadConfig } from '../src/server/config.js';
import { cacheKey } from '../src/server/serpapi/cache.js';
import { SerpClient } from '../src/server/serpapi/client.js';
import { redactResponse } from '../src/server/serpapi/redact.js';
import { buildPatentSearchParams } from '../src/server/patents/search.js';
import { fetchPatentDetails } from '../src/server/patents/details.js';
import { fetchShopping, shoppingParams } from '../src/server/market/shopping.js';
import { fetchMaps, mapsParams } from '../src/server/market/maps.js';
import { fetchScholar, scholarParams } from '../src/server/literature/scholar.js';
import { fetchNews, newsParams } from '../src/server/news/news.js';

const FIXTURES = 'fixtures/replay';

async function save(engine: string, params: Record<string, string | number>, body: unknown): Promise<string> {
  const key = cacheKey(engine as import('../src/server/serpapi/types.js').SerpEngine, params);
  const name = `${engine}__${key}.json`;
  const redacted = redactResponse(body as import('../src/server/serpapi/types.js').SerpResponse);
  await mkdir(FIXTURES, { recursive: true });
  await writeFile(join(FIXTURES, name), JSON.stringify(redacted, null, 2), 'utf8');
  return name;
}

async function main(): Promise<void> {
  const cliArgs = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  const query = cliArgs[0] ?? 'centrifugal governor';
  const minimal = process.argv.includes('--minimal');
  if (!process.env.SERPAPI_API_KEY) {
    console.error('SERPAPI_API_KEY required');
    process.exit(2);
  }
  process.env.RENAISSANCE_MODE = 'live';
  resetConfigForTests();
  loadConfig(process.env);

  const client = new SerpClient();
  const searchParams = buildPatentSearchParams(query);
  const search = await client.call('google_patents', searchParams, {});
  const searchFile = await save('google_patents', searchParams, search.body);
  console.log('Wrote', searchFile);

  const hits = (search.body.organic_results ?? []) as Array<{ patent_id?: string }>;
  const patentIds = hits.map((h) => h.patent_id).filter(Boolean).slice(0, minimal ? 1 : 3) as string[];

  for (const patentId of patentIds) {
    await fetchPatentDetails(client, patentId, {});
    const detailBody = await client.call('google_patents_details', { patent_id: patentId }, { patentId });
    const f = await save('google_patents_details', { patent_id: patentId }, detailBody.body);
    console.log('Wrote', f, patentId);
  }

  if (!minimal) {
    const shop = await fetchShopping(client, query, {});
    await save('google_shopping', shoppingParams(query), shop.body);

    const maps = await fetchMaps(client, query, 'Pune', {});
    await save('google_maps', mapsParams(query, 'Pune'), maps.body);

    const scholar = await fetchScholar(client, query, {});
    await save('google_scholar', scholarParams(query), scholar.body);

    const news = await fetchNews(client, query, {});
    await save('google_news', newsParams(query), news.body);
  }

  console.log('Done. Credits this run:', client.ledger.totalCredits());
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
