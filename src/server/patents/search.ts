import type { SerpClient } from '../serpapi/client.js';
import type { SerpResponse } from '../serpapi/types.js';
import type { PatentSearchHit } from './types.js';

export function filingCutoffYear(now = new Date()): number {
  return now.getFullYear() - 20;
}

export function buildPatentSearchParams(query: string): Record<string, string | number> {
  const cutoff = filingCutoffYear();
  return {
    q: query,
    before: `filing:${cutoff}0101`,
    status: 'GRANT',
    type: 'PATENT',
    num: 10,
  };
}

export function parsePatentSearchResults(body: SerpResponse): PatentSearchHit[] {
  const results = (body.organic_results ?? body.patents_results ?? []) as Array<Record<string, unknown>>;
  return results.map((r) => ({
    patent_id: String(r.patent_id ?? r.publication_number ?? r.position ?? ''),
    title: String(r.title ?? ''),
    publication_date: typeof r.publication_date === 'string' ? r.publication_date : undefined,
    filing_date: typeof r.filing_date === 'string' ? r.filing_date : undefined,
    inventor: typeof r.inventor === 'string' ? r.inventor : undefined,
    assignee: typeof r.assignee === 'string' ? r.assignee : undefined,
    country_status:
      r.country_status && typeof r.country_status === 'object'
        ? (r.country_status as Record<string, string>)
        : undefined,
    snippet: typeof r.snippet === 'string' ? r.snippet.slice(0, 300) : undefined,
  }));
}

export async function searchPatents(
  client: SerpClient,
  query: string,
  ctx: { scanId?: string } = {},
): Promise<{ hits: PatentSearchHit[]; callId: string; searchMetadataId: string | null }> {
  const params = buildPatentSearchParams(query);
  const { body, receipt } = await client.call('google_patents', params, { scanId: ctx.scanId });
  if (body.error) {
    return { hits: [], callId: receipt.callId, searchMetadataId: receipt.searchMetadataId };
  }
  return {
    hits: parsePatentSearchResults(body),
    callId: receipt.callId,
    searchMetadataId: receipt.searchMetadataId,
  };
}
