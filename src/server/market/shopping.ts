import type { Fact } from '../../shared/types.js';
import type { SerpClient } from '../serpapi/client.js';
import type { SerpResponse } from '../serpapi/types.js';
import { nextFactId } from '../brief/factIds.js';

export function shoppingParams(query: string): Record<string, string> {
  return {
    q: query,
    google_domain: 'google.co.in',
    gl: 'in',
    hl: 'en',
  };
}

type ShoppingItem = {
  extracted_price?: number;
  price?: string;
  source?: string;
};

export function parseShopping(body: SerpResponse): {
  items: ShoppingItem[];
  sellers: Set<string>;
  prices: number[];
  mixedCurrency: boolean;
} {
  const results = (body.shopping_results ?? []) as ShoppingItem[];
  const sellers = new Set<string>();
  const prices: number[] = [];
  let mixedCurrency = false;
  for (const r of results) {
    if (r.source) sellers.add(r.source);
    if (typeof r.extracted_price === 'number') prices.push(r.extracted_price);
    else if (r.price && /[^0-9.,\s₹$€£]/.test(r.price)) mixedCurrency = true;
  }
  return { items: results, sellers, prices, mixedCurrency };
}

export function shoppingFacts(
  body: SerpResponse,
  source: Fact['source'],
): Fact[] {
  const parsed = parseShopping(body);
  const facts: Fact[] = [];
  const n = parsed.items.length;
  facts.push({
    id: nextFactId(),
    key: 'market.n_listings',
    kind: 'market',
    text: `Shopping listings found: ${n}`,
    value: n,
    source,
  });
  facts.push({
    id: nextFactId(),
    key: 'market.n_sellers',
    kind: 'market',
    text: `Distinct sellers: ${parsed.sellers.size}`,
    value: parsed.sellers.size,
    source,
  });
  if (parsed.prices.length > 0) {
    const sorted = [...parsed.prices].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    facts.push({
      id: nextFactId(),
      key: 'market.price_median',
      kind: 'market',
      text: `Median extracted price: ${median}`,
      value: median,
      unit: 'INR',
      source,
    });
    facts.push({
      id: nextFactId(),
      key: 'market.price_min',
      kind: 'market',
      text: `Minimum extracted price: ${sorted[0]}`,
      value: sorted[0],
      unit: 'INR',
      source,
    });
    facts.push({
      id: nextFactId(),
      key: 'market.price_max',
      kind: 'market',
      text: `Maximum extracted price: ${sorted[sorted.length - 1]}`,
      value: sorted[sorted.length - 1],
      unit: 'INR',
      source,
    });
  }
  if (n > 0 && n < 5) {
    facts.push({
      id: nextFactId(),
      key: 'market.few_listings',
      kind: 'market',
      text: 'Few shopping listings matched the query',
      value: 'true',
      source,
    });
  }
  if (parsed.mixedCurrency) {
    facts.push({
      id: nextFactId(),
      key: 'market.mixed_currency',
      kind: 'market',
      text: 'Listings include mixed or unparsed currencies',
      value: 'true',
      source,
    });
  }
  return facts;
}

export async function fetchShopping(
  client: SerpClient,
  query: string,
  ctx: { scanId?: string; patentId?: string },
): Promise<{ facts: Fact[]; callId: string; searchMetadataId: string | null; body: SerpResponse }> {
  const { body, receipt } = await client.call('google_shopping', shoppingParams(query), ctx);
  const source = {
    callId: receipt.callId,
    engine: 'google_shopping',
    searchMetadataId: receipt.searchMetadataId,
    path: 'shopping_results',
  };
  const facts = body.error ? [] : shoppingFacts(body, source);
  return { facts, callId: receipt.callId, searchMetadataId: receipt.searchMetadataId, body };
}
