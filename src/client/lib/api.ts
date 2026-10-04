import type { QueryKey } from '@tanstack/react-query';
import type { DesignBrief, Fact, ScanRecord, StatusReport } from '@/shared/types';

const API_ROOT = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

function url(path: string): string {
  return `${API_ROOT}${path}`;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

async function parseJson(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    return {};
  }
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit & { accessCode?: string } = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.accessCode) headers.set('X-Access-Code', init.accessCode);
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const res = await fetch(url(path), {
    ...init,
    headers,
    credentials: 'include',
  });
  const payload = await parseJson(res);
  if (!res.ok) {
    const detail =
      (payload as { detail?: string; title?: string; error?: string }).detail ??
      (payload as { title?: string }).title ??
      (payload as { error?: string }).error ??
      `Request failed (${res.status})`;
    throw new ApiError(String(detail), res.status);
  }
  return payload as T;
}

export type AppConfigResponse = {
  mode: 'live' | 'replay' | 'record';
  serpapiEnabled: boolean;
  limits: { dailyCreditCap: number; monthlyHardCap: number; perBriefCap: number };
  remainingCredits?: { monthly: number };
};

export type PatentSearchHit = {
  patent_id: string;
  title: string;
  publication_date?: string;
  filing_date?: string;
  inventor?: string;
  assignee?: string;
  country_status?: Record<string, string>;
  snippet?: string;
};

export type SearchResponse = {
  hits: PatentSearchHit[];
  receipt: { callId: string; searchMetadataId: string | null };
};

export type ProjectSummary = {
  id: string;
  title: string;
  query: string;
  patentId: string;
  city: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ScanResponse = ScanRecord & {
  statusReport?: StatusReport;
  facts: Fact[];
  brief?: DesignBrief;
};

export function createQueryKey(name: string, args?: unknown): QueryKey {
  return [name, args];
}

export const renaissanceApi = {
  getConfig: () => apiFetch<AppConfigResponse>('/api/v1/config'),
  estimateCredits: (kind: 'search' | 'dossier') =>
    apiFetch<{ credits: number; kind: string }>('/api/v1/estimate', {
      method: 'POST',
      body: JSON.stringify({ kind }),
    }),
  search: (q: string, accessCode?: string) =>
    apiFetch<SearchResponse>(`/api/v1/search?q=${encodeURIComponent(q)}`, { accessCode }),
  startScan: (body: { patentId: string; query: string; city: string; title?: string }, accessCode?: string) =>
    apiFetch<{ scanId: string; projectId: string }>('/api/v1/scans', {
      method: 'POST',
      body: JSON.stringify(body),
      accessCode,
    }),
  getScan: (scanId: string) => apiFetch<ScanResponse>(`/api/v1/scans/${scanId}`),
  listProjects: () => apiFetch<{ projects: ProjectSummary[] }>('/api/v1/projects'),
  getProject: (id: string) =>
    apiFetch<{ project: ProjectSummary; scans: ScanResponse[] }>(`/api/v1/projects/${id}`),
  rescan: (projectId: string, accessCode?: string) =>
    apiFetch<{ scanId: string }>(`/api/v1/projects/${projectId}/rescan`, {
      method: 'POST',
      accessCode,
    }),
  projectDiff: (projectId: string) =>
    apiFetch<{ diff: Array<{ key: string; change: string }> }>(`/api/v1/projects/${projectId}/diff`),
  getBudget: () => apiFetch<Record<string, unknown>>('/api/v1/budget'),
};

/** @deprecated Legacy Modelence-style adapter — prefer renaissanceApi */
export function apiQuery(_name: string, _args?: unknown): never {
  throw new Error('apiQuery is deprecated; use renaissanceApi');
}

export function apiMutation(_name: string): never {
  throw new Error('apiMutation is deprecated; use renaissanceApi');
}
