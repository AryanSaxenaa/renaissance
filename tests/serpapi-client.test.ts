import { describe, expect, it } from 'vitest';
import { resetConfigForTests, loadConfig } from '../src/server/config.js';
import { SerpClient } from '../src/server/serpapi/client.js';
import { redactParams } from '../src/server/serpapi/redact.js';
import type { TransportRequest, TransportResult } from '../src/server/serpapi/types.js';

describe('SerpClient with mock transport', () => {
  it('records credits on success', async () => {
    resetConfigForTests();
    process.env.RENAISSANCE_MODE = 'replay';
    loadConfig(process.env);
    const client = SerpClient.withMock(async (_req: TransportRequest): Promise<TransportResult> => ({
      body: { search_metadata: { id: 'mock-1' } },
      httpStatus: 200,
      fromCache: false,
      fromReplay: false,
    }));
    const { body, receipt } = await client.call('google_news', { q: 'test' });
    expect(body.search_metadata?.id).toBe('mock-1');
    expect(receipt.credits).toBe(1);
    expect(receipt.cacheHit).toBe(false);
  });

  it('cache hit charges zero credits', async () => {
    const client = SerpClient.withMock(async (): Promise<TransportResult> => ({
      body: { search_metadata: { id: 'mock-2' } },
      httpStatus: 200,
      fromCache: false,
      fromReplay: false,
    }));
    await client.call('google_scholar', { q: 'a', num: 1 });
    const second = await client.call('google_scholar', { q: 'a', num: 1 });
    expect(second.receipt.cacheHit).toBe(true);
    expect(second.receipt.credits).toBe(0);
  });

  it('redacts api_key from params', () => {
    const redacted = redactParams({ q: 'x', api_key: 'secret-value-should-not-appear' });
    expect(redacted.api_key).toBeUndefined();
    expect(JSON.stringify(redacted)).not.toContain('secret-value');
  });

  it('budget refusal returns error body', async () => {
    const client = SerpClient.withMock(async (): Promise<TransportResult> => ({
      body: {},
      httpStatus: 200,
      fromCache: false,
      fromReplay: false,
    }));
    for (let i = 0; i < 240; i++) client.budget.spend('google_patents', 1);
    const { body } = await client.call('google_patents', { q: 'z' });
    expect(body.error).toBe('monthly_cap');
  });
});
