import type { SerpParams, SerpResponse } from './types.js';

const SECRET_KEYS = new Set(['api_key', 'apiKey', 'API_KEY']);

export function redactParams(params: SerpParams): SerpParams {
  const out: SerpParams = {};
  for (const [k, v] of Object.entries(params)) {
    if (SECRET_KEYS.has(k)) continue;
    out[k] = v;
  }
  return out;
}

export function redactResponse(body: SerpResponse): SerpResponse {
  const clone = JSON.parse(JSON.stringify(body)) as SerpResponse;
  if (clone.search_parameters && typeof clone.search_parameters === 'object') {
    const sp = { ...clone.search_parameters };
    delete sp.api_key;
    delete sp.apiKey;
    clone.search_parameters = sp;
  }
  delete (clone as Record<string, unknown>).api_key;
  return clone;
}

export function assertNoApiKeyInJson(text: string): void {
  if (/api_key/i.test(text) && /[a-zA-Z0-9]{20,}/.test(text)) {
    throw new Error('api_key material detected in serialized payload');
  }
}
