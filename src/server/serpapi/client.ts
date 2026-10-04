import { createHash, randomUUID } from 'node:crypto';
import type { AppConfig } from '../config.js';
import { getConfig } from '../config.js';
import { logger } from '../logger.js';
import { HourlyBucket } from './bucket.js';
import { InMemorySerpCache, cacheKey } from './cache.js';
import { SerpBudget } from './budget.js';
import { SerpLedger } from './ledger.js';
import { redactParams, redactResponse } from './redact.js';
import { createTransport, MockTransport } from './transport.js';
import type {
  SerpEngine,
  SerpParams,
  SerpReceipt,
  SerpResponse,
  SerpTransport,
  TransportRequest,
  TransportResult,
} from './types.js';
import { ENGINE_CREDITS } from './types.js';

export type SerpClientOptions = {
  transport?: SerpTransport;
  cache?: InMemorySerpCache;
  ledger?: SerpLedger;
  budget?: SerpBudget;
  bucket?: HourlyBucket;
};

export type CallContext = {
  scanId?: string;
  patentId?: string;
};

const inFlight = new Map<string, Promise<SerpResponse>>();

export class SerpClient {
  readonly cache: InMemorySerpCache;
  readonly ledger: SerpLedger;
  readonly budget: SerpBudget;
  readonly bucket: HourlyBucket;
  private readonly transport: SerpTransport;
  private readonly config: AppConfig;

  constructor(opts: SerpClientOptions = {}) {
    this.config = getConfig();
    this.transport = opts.transport ?? createTransport(this.config);
    this.cache = opts.cache ?? new InMemorySerpCache();
    this.ledger = opts.ledger ?? new SerpLedger();
    this.budget = opts.budget ?? new SerpBudget(
      this.config.SERPAPI_MONTHLY_HARD_CAP,
      this.config.DAILY_CREDIT_CAP,
      this.config.PER_BRIEF_CREDIT_CAP,
    );
    this.bucket = opts.bucket ?? new HourlyBucket();
  }

  static withMock(handler: (req: TransportRequest) => TransportResult | Promise<TransportResult>): SerpClient {
    return new SerpClient({ transport: new MockTransport(handler) });
  }

  async call(
    engine: SerpEngine,
    params: SerpParams,
    ctx: CallContext = {},
    options: { noCache?: boolean } = {},
  ): Promise<{ body: SerpResponse; receipt: SerpReceipt }> {
    const key = cacheKey(engine, params);
    const dedupeKey = key;

    if (!options.noCache) {
      const hit = this.cache.get(key);
      if (hit) {
        const receipt = this.buildReceipt(engine, params, hit.body, {
          httpStatus: 200,
          credits: 0,
          cacheHit: true,
          latencyMs: 0,
          rawKey: key,
          ctx,
        });
        this.ledger.record(receipt);
        return { body: hit.body, receipt };
      }
    }

    const budgetCheck = this.budget.canSpend(engine, false);
    if (!budgetCheck.allowed) {
      const body: SerpResponse = { error: budgetCheck.reason ?? 'budget_denied' };
      const receipt = this.buildReceipt(engine, params, body, {
        httpStatus: 402,
        credits: 0,
        cacheHit: false,
        latencyMs: 0,
        rawKey: key,
        ctx,
      });
      this.ledger.record(receipt);
      return { body, receipt };
    }

    const bucketCheck = this.bucket.tryTake();
    if (!bucketCheck.ok) {
      const body: SerpResponse = { error: 'hourly_rate_limit', retry_after_ms: bucketCheck.retryAfterMs };
      const receipt = this.buildReceipt(engine, params, body, {
        httpStatus: 429,
        credits: 0,
        cacheHit: false,
        latencyMs: 0,
        rawKey: key,
        ctx,
      });
      this.ledger.record(receipt);
      return { body, receipt };
    }

    let pending = inFlight.get(dedupeKey);
    if (!pending) {
      pending = this.executeOnce(engine, params, key, ctx);
      inFlight.set(dedupeKey, pending);
      pending.finally(() => inFlight.delete(dedupeKey));
    }

    const body = await pending;
    const receipt = this.ledger.list().find((r) => r.rawKey === key && r.engine === engine);
    if (!receipt) {
      throw new Error('ledger_missing_after_call');
    }
    return { body, receipt };
  }

  private async executeOnce(
    engine: SerpEngine,
    params: SerpParams,
    key: string,
    ctx: CallContext,
  ): Promise<SerpResponse> {
    const start = Date.now();
    const req: TransportRequest = { engine, params };
    const result = await this.transport.execute(req);
    const latencyMs = Date.now() - start;
    const redacted = redactResponse(result.body);
    const credits = result.httpStatus === 200 && !result.fromCache ? ENGINE_CREDITS[engine] : 0;
    if (credits > 0) this.budget.spend(engine, credits);

    if (result.httpStatus === 200 && !result.body.error) {
      this.cache.set(engine, key, redacted);
    }

    const receipt = this.buildReceipt(engine, params, redacted, {
      httpStatus: result.httpStatus,
      credits,
      cacheHit: false,
      latencyMs,
      rawKey: key,
      ctx,
    });
    this.ledger.record(receipt);
    logger.info({ engine, callId: receipt.callId, cacheHit: false, credits }, 'serpapi_call');
    return redacted;
  }

  private buildReceipt(
    engine: SerpEngine,
    params: SerpParams,
    body: SerpResponse,
    meta: {
      httpStatus: number;
      credits: number;
      cacheHit: boolean;
      latencyMs: number;
      rawKey: string;
      ctx: CallContext;
    },
  ): SerpReceipt {
    const sha256Raw = createHash('sha256').update(JSON.stringify(body)).digest('hex');
    return {
      callId: randomUUID(),
      scanId: meta.ctx.scanId,
      patentId: meta.ctx.patentId,
      engine,
      paramsRedacted: redactParams(params),
      searchMetadataId: body.search_metadata?.id ?? null,
      jsonEndpoint: body.search_metadata?.json_endpoint ?? null,
      httpStatus: meta.httpStatus,
      credits: meta.credits,
      cacheHit: meta.cacheHit,
      latencyMs: meta.latencyMs,
      rawKey: meta.rawKey,
      sha256Raw,
      createdAt: new Date().toISOString(),
    };
  }
}
