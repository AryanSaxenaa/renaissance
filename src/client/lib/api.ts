import type { QueryKey } from '@tanstack/react-query';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/$/, '');

async function request<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || `Request failed (${response.status})`);
  return payload.data as T;
}

function route(name: string, kind: 'query' | 'mutation') {
  const [module, method] = name.split('.');
  return `/${kind}/${encodeURIComponent(module)}/${encodeURIComponent(method)}`;
}

export function createQueryKey(name: string, args?: unknown): QueryKey {
  return [name, args];
}

export function apiQuery<T>(name: string, args?: unknown) {
  return {
    queryKey: createQueryKey(name, args),
    queryFn: () => request<T>(route(name, 'query'), args),
  };
}

export function apiMutation<T = unknown>(name: string) {
  return {
    mutationFn: (args?: unknown) => request<T>(route(name, 'mutation'), args),
  };
}
