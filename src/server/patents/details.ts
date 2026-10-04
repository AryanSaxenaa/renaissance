import type { SerpClient } from '../serpapi/client.js';
import type { SerpResponse } from '../serpapi/types.js';
import type { PatentDetails } from './types.js';

function asString(v: unknown): string | undefined {
  if (typeof v === 'string') return v;
  return undefined;
}

function asArray<T>(v: unknown): T[] {
  if (Array.isArray(v)) return v as T[];
  return [];
}

export function parsePatentDetails(patentId: string, body: SerpResponse): PatentDetails {
  const root = body as Record<string, unknown>;
  const details = (root.patent_details ?? root) as Record<string, unknown>;

  const claimsRaw = details.claims;
  let claims: string[] = [];
  if (typeof claimsRaw === 'string') claims = [claimsRaw];
  else if (Array.isArray(claimsRaw)) {
    claims = claimsRaw.map((c) => (typeof c === 'string' ? c : String((c as { text?: string }).text ?? '')));
  }

  const worldwide = asArray<Record<string, unknown>>(details.worldwide_applications).map((w) => ({
    country_code: asString(w.country_code),
    application_number: asString(w.application_number),
    filing_date: asString(w.filing_date),
    legal_status: asString(w.legal_status),
    legal_status_cat: asString(w.legal_status_cat),
    this_app: w.this_app === true,
  }));

  const parents = asArray<Record<string, unknown>>(details.parent_applications).map((p) => ({
    application_number: asString(p.application_number),
    filing_date: asString(p.filing_date),
  }));

  const events = asArray<Record<string, unknown>>(details.legal_events).map((e) => ({
    code: asString(e.code),
    title: asString(e.title),
    date: asString(e.date),
  }));

  return {
    patent_id: patentId,
    title: asString(details.title) ?? asString(root.title),
    abstract: asString(details.abstract) ?? asString(root.abstract),
    claims,
    filing_date: asString(details.filing_date),
    publication_date: asString(details.publication_date),
    worldwide_applications: worldwide,
    parent_applications: parents,
    legal_events: events,
  };
}

export async function fetchPatentDetails(
  client: SerpClient,
  patentId: string,
  ctx: { scanId?: string } = {},
  options?: { noCache?: boolean },
): Promise<{ details: PatentDetails; callId: string; searchMetadataId: string | null }> {
  const { body, receipt } = await client.call(
    'google_patents_details',
    { patent_id: patentId },
    { scanId: ctx.scanId, patentId },
    options,
  );
  if (body.error) {
    throw new Error(String(body.error));
  }
  return {
    details: parsePatentDetails(patentId, body),
    callId: receipt.callId,
    searchMetadataId: receipt.searchMetadataId,
  };
}
