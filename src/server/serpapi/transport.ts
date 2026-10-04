import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { getJson } from 'serpapi';
import type { AppConfig } from '../config.js';
import { cacheKey } from './cache.js';
import type { SerpResponse, SerpTransport, TransportRequest, TransportResult } from './types.js';

export class LiveTransport implements SerpTransport {
  constructor(
    private readonly apiKey: string,
    private readonly maxRetries = 1,
  ) {}

  async execute(req: TransportRequest): Promise<TransportResult> {
    const params = { ...req.params, api_key: this.apiKey };
    let lastError: unknown;
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const body = (await getJson(req.engine, params)) as SerpResponse;
        if (body.error) {
          return { body, httpStatus: 400, fromCache: false, fromReplay: false };
        }
        return { body, httpStatus: 200, fromCache: false, fromReplay: false };
      } catch (err) {
        lastError = err;
        const status = (err as { status?: number }).status;
        if (status === 401) {
          return {
            body: { error: 'unauthorized' },
            httpStatus: 401,
            fromCache: false,
            fromReplay: false,
          };
        }
        if (status === 429) {
          return {
            body: { error: 'rate_limited' },
            httpStatus: 429,
            fromCache: false,
            fromReplay: false,
          };
        }
        if (attempt < this.maxRetries && (status === undefined || status >= 500)) {
          continue;
        }
      }
    }
    return {
      body: { error: String(lastError) },
      httpStatus: 502,
      fromCache: false,
      fromReplay: false,
    };
  }
}

export class ReplayTransport implements SerpTransport {
  constructor(private readonly fixturesDir: string) {}

  async execute(req: TransportRequest): Promise<TransportResult> {
    const key = cacheKey(req.engine, req.params);
    const filePath = join(this.fixturesDir, `${req.engine}__${key}.json`);
    try {
      const raw = await readFile(filePath, 'utf8');
      const body = JSON.parse(raw) as SerpResponse;
      return { body, httpStatus: 200, fromCache: false, fromReplay: true };
    } catch {
      return {
        body: {
          error: `not_in_fixture: ${req.engine} fingerprint ${key}`,
        },
        httpStatus: 404,
        fromCache: false,
        fromReplay: true,
      };
    }
  }
}

export function createTransport(config: AppConfig): SerpTransport {
  if (config.mode === 'replay') {
    return new ReplayTransport(config.FIXTURES_REPLAY_DIR);
  }
  if (!config.SERPAPI_API_KEY) {
    return new ReplayTransport(config.FIXTURES_REPLAY_DIR);
  }
  return new LiveTransport(config.SERPAPI_API_KEY);
}

export class MockTransport implements SerpTransport {
  constructor(private readonly handler: (req: TransportRequest) => TransportResult | Promise<TransportResult>) {}

  async execute(req: TransportRequest): Promise<TransportResult> {
    return await this.handler(req);
  }
}
