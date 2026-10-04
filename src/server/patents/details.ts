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

/** SerpApi returns worldwide_applications as an array or a year-keyed object. */
export function flattenWorldwideApplications(raw: unknown): Record<string, unknown>[] {
  if (Array.isArray(raw)) return raw as Record<string, unknown>[];
  if (raw && typeof raw === 'object') {
    const out: Record<string, unknown>[] = [];
    for (const value of Object.values(raw as Record<string, unknown>)) {
      if (Array.isArray(value)) out.push(...(value as Record<string, unknown>[]));
    }
    return out;
  }
  return [];
}

function parseLegalEvents(raw: unknown): PatentDetails['legal_events'] {
  const rows = asArray<Record<string, unknown>>(raw);
  return rows
    .map((e) => ({
      code: asString(e.code) ?? asString(e.type) ?? '',
      title: asString(e.title) ?? '',
      date: asString(e.date) ?? '',
    }))
    .filter((e) => {
      if (e.date === 'Status') return false;
      if (!e.title && !e.code) return false;
      return true;
    });
}

export function parsePatentDetails(patentId: string, body: SerpResponse): PatentDetails {
  const root = body as Record<string, unknown>;
  const details = (root.patent_details ?? root) as Record<string, unknown>;

  const claimsRaw = details.claims ?? root.claims;
  let claims: string[] = [];
  if (typeof claimsRaw === 'string') claims = [claimsRaw];
  else if (Array.isArray(claimsRaw)) {
    claims = claimsRaw.map((c) => (typeof c === 'string' ? c : String((c as { text?: string }).text ?? '')));
  }

  const worldwideRaw = details.worldwide_applications ?? root.worldwide_applications;
  const worldwide = flattenWorldwideApplications(worldwideRaw).map((w) => ({
    country_code: asString(w.country_code),
    application_number: asString(w.application_number),
    filing_date: asString(w.filing_date),
    legal_status: asString(w.legal_status),
    legal_status_cat: asString(w.legal_status_cat),
    this_app: w.this_app === true,
  }));

  const parents = asArray<Record<string, unknown>>(details.parent_applications ?? root.parent_applications).map(
    (p) => ({
      application_number: asString(p.application_number),
      filing_date: asString(p.filing_date),
    }),
  );

  const eventsRaw = details.legal_events ?? details.events ?? root.legal_events ?? root.events;
  const events = parseLegalEvents(eventsRaw);

  return {
    patent_id: patentId,
    title: asString(details.title) ?? asString(root.title),
    abstract: asString(details.abstract) ?? asString(root.abstract),
    claims,
    filing_date: asString(details.filing_date) ?? asString(root.filing_date),
    publication_date: asString(details.publication_date) ?? asString(root.publication_date),
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
