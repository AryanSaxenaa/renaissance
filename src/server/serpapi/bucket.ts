/**
 * Hourly rate bucket for SerpApi 429 handling (pause until next hour).
 */
export class HourlyBucket {
  private count = 0;
  private windowStart = Date.now();
  private readonly limit: number;
  private readonly windowMs: number;

  constructor(limit = 100, windowMs = 60 * 60 * 1000) {
    this.limit = limit;
    this.windowMs = windowMs;
  }

  private roll(): void {
    const now = Date.now();
    if (now - this.windowStart >= this.windowMs) {
      this.windowStart = now;
      this.count = 0;
    }
  }

  tryTake(): { ok: boolean; retryAfterMs?: number } {
    this.roll();
    if (this.count >= this.limit) {
      const retryAfterMs = this.windowMs - (Date.now() - this.windowStart);
      return { ok: false, retryAfterMs };
    }
    this.count += 1;
    return { ok: true };
  }

  reset(): void {
    this.count = 0;
    this.windowStart = Date.now();
  }
}
