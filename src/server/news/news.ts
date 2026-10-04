import type { Fact } from '../../shared/types.js';
import type { SerpClient } from '../serpapi/client.js';
import type { SerpResponse } from '../serpapi/types.js';
import { nextFactId } from '../brief/factIds.js';

export function newsParams(query: string): Record<string, string> {
  return { q: query, hl: 'en', gl: 'in' };
}

export function newsFacts(body: SerpResponse, source: Fact['source']): Fact[] {
  const results = (body.news_results ?? []) as Array<{ title?: string; iso_date?: string; source?: { name?: string } }>;
  const n = results.length;
  const facts: Fact[] = [
    {
      id: nextFactId(),
      key: 'news.n_articles',
      kind: 'news',
      text: `News articles: ${n}`,
      value: n,
      source,
    },
  ];
  const latest = results[0];
  if (latest?.title) {
    facts.push({
      id: nextFactId(),
      key: 'news.latest',
      kind: 'news',
      text: `Latest headline: ${latest.title}`,
      source,
    });
  }
  if (latest?.iso_date) {
    facts.push({
      id: nextFactId(),
      key: 'news.latest_date',
      kind: 'news',
      text: `Latest article date: ${latest.iso_date}`,
      value: latest.iso_date,
      source,
    });
  }
  return facts;
}

export async function fetchNews(
  client: SerpClient,
  query: string,
  ctx: { scanId?: string; patentId?: string },
  options?: { skip?: boolean },
): Promise<{ facts: Fact[]; callId: string; searchMetadataId: string | null }> {
  if (options?.skip) {
    return { facts: [], callId: 'skipped', searchMetadataId: null };
  }
  const { body, receipt } = await client.call('google_news', newsParams(query), ctx);
  const source = {
    callId: receipt.callId,
    engine: 'google_news',
    searchMetadataId: receipt.searchMetadataId,
    path: 'news_results',
  };
  const facts = body.error ? [] : newsFacts(body, source);
  return { facts, callId: receipt.callId, searchMetadataId: receipt.searchMetadataId };
}
