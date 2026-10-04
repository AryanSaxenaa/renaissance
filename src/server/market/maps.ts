import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Fact } from '../../shared/types.js';
import type { SerpClient } from '../serpapi/client.js';
import type { SerpResponse } from '../serpapi/types.js';
import { nextFactId } from '../brief/factIds.js';

export type CityEntry = { name: string; lat: number; lng: number };

let citiesCache: CityEntry[] | null = null;

export function loadCities(): CityEntry[] {
  if (citiesCache) return citiesCache;
  const path = resolve('data/cities.json');
  citiesCache = JSON.parse(readFileSync(path, 'utf8')) as CityEntry[];
  return citiesCache;
}

export function isAllowedCity(city: string): boolean {
  const norm = city.trim().toLowerCase();
  return loadCities().some((c) => c.name.toLowerCase() === norm);
}

export function mapsParams(query: string, city: string): Record<string, string | number> {
  const entry = loadCities().find((c) => c.name.toLowerCase() === city.trim().toLowerCase());
  if (!entry) throw new Error('city_not_allowed');
  return {
    q: `${query} manufacturer`,
    type: 'search',
    ll: `@${entry.lat},${entry.lng},12z`,
    hl: 'en',
  };
}

export function mapsFacts(body: SerpResponse, source: Fact['source'], city: string): Fact[] {
  const places = (body.local_results ?? body.places_results ?? []) as unknown[];
  const n = Array.isArray(places) ? places.length : 0;
  const facts: Fact[] = [
    {
      id: nextFactId(),
      key: 'makers.n_places',
      kind: 'maker',
      text: `Map places near ${city}: ${n}`,
      value: n,
      source,
    },
  ];
  if (n === 0) {
    facts.push({
      id: nextFactId(),
      key: 'makers.sparse',
      kind: 'maker',
      text: `No map results near ${city} for this query`,
      value: 'true',
      source,
    });
  }
  return facts;
}

export async function fetchMaps(
  client: SerpClient,
  query: string,
  city: string,
  ctx: { scanId?: string; patentId?: string },
): Promise<{ facts: Fact[]; callId: string; searchMetadataId: string | null; body: SerpResponse }> {
  const { body, receipt } = await client.call('google_maps', mapsParams(query, city), ctx);
  const source = {
    callId: receipt.callId,
    engine: 'google_maps',
    searchMetadataId: receipt.searchMetadataId,
    path: 'local_results',
  };
  const facts = body.error ? [] : mapsFacts(body, source, city);
  return { facts, callId: receipt.callId, searchMetadataId: receipt.searchMetadataId, body };
}
