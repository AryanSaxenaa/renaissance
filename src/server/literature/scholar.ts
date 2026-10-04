import type { Fact } from '../../shared/types.js';
import { getConfig } from '../config.js';
import type { SerpClient } from '../serpapi/client.js';
import type { SerpResponse } from '../serpapi/types.js';
import { nextFactId } from '../brief/factIds.js';

export function scholarParams(query: string): Record<string, string | number> {
  const year = getConfig().mode === 'replay' ? 2020 : new Date().getUTCFullYear() - 5;
  return {
    q: query,
    as_ylo: year,
    num: 10,
  };
}

export function scholarFacts(body: SerpResponse, source: Fact['source']): Fact[] {
  const results = (body.organic_results ?? []) as unknown[];
  const n = Array.isArray(results) ? results.length : 0;
  return [
    {
      id: nextFactId(),
      key: 'lit.n_recent',
      kind: 'paper',
      text: `Recent scholar results: ${n}`,
      value: n,
      source,
    },
  ];
}

export async function fetchScholar(
  client: SerpClient,
  query: string,
  ctx: { scanId?: string; patentId?: string },
): Promise<{ facts: Fact[]; callId: string; searchMetadataId: string | null; body: SerpResponse }> {
  const { body, receipt } = await client.call('google_scholar', scholarParams(query), ctx);
  const source = {
    callId: receipt.callId,
    engine: 'google_scholar',
    searchMetadataId: receipt.searchMetadataId,
    path: 'organic_results',
  };
  const facts = body.error ? [] : scholarFacts(body, source);
  return { facts, callId: receipt.callId, searchMetadataId: receipt.searchMetadataId, body };
}
