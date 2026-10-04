import type { SerpReceipt } from './types.js';

export class SerpLedger {
  private entries: SerpReceipt[] = [];

  record(receipt: SerpReceipt): void {
    this.entries.push(receipt);
  }

  list(scanId?: string): SerpReceipt[] {
    if (!scanId) return [...this.entries];
    return this.entries.filter((e) => e.scanId === scanId);
  }

  totalCredits(scanId?: string): number {
    return this.list(scanId).reduce((sum, e) => sum + e.credits, 0);
  }

  clear(): void {
    this.entries = [];
  }
}
