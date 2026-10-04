import { createHash } from 'node:crypto';
import type { SerpEngine, SerpParams, SerpResponse } from './types.js';
import { redactParams } from './redact.js';

export type CacheEntry = {
  key: string;
  engine: SerpEngine;
  body: SerpResponse;
  searchMetadataId: string | null;
  createdAt: number;
  expiresAt: number;
};

export function cacheKey(engine: SerpEngine, params: SerpParams): string {
  const canonical = redactParams(params);
  const sorted = Object.keys(canonical)
    .sort()
    .map((k) => `${k}=${String(canonical[k])}`)
    .join('&');
  return createHash('sha256').update(`${engine}|${sorted}`).digest('hex');
}

const DEFAULT_TTL_MS: Partial<Record<SerpEngine, number>> = {
  google_patents: 30 * 24 * 60 * 60 * 1000,
  google_patents_details: 30 * 24 * 60 * 60 * 1000,
  google_scholar: 14 * 24 * 60 * 60 * 1000,
  google_shopping: 24 * 60 * 60 * 1000,
  google_maps: 24 * 60 * 60 * 1000,
  google_news: 24 * 60 * 60 * 1000,
};

export class InMemorySerpCache {
  private store = new Map<string, CacheEntry>();

  get(key: string): CacheEntry | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt < Date.now()) {
      this.store.delete(key);
      return undefined;
    }
    return entry;
  }

  set(engine: SerpEngine, key: string, body: SerpResponse, ttlOverrideMs?: number): CacheEntry {
    const ttl = ttlOverrideMs ?? DEFAULT_TTL_MS[engine] ?? 24 * 60 * 60 * 1000;
    const entry: CacheEntry = {
      key,
      engine,
      body,
      searchMetadataId: body.search_metadata?.id ?? null,
      createdAt: Date.now(),
      expiresAt: Date.now() + ttl,
    };
    this.store.set(key, entry);
    return entry;
  }

  clear(): void {
    this.store.clear();
  }
}
