import type { SerpEngine } from './types.js';
import { ENGINE_CREDITS } from './types.js';

export type BudgetState = {
  monthlySpent: number;
  dailySpent: number;
  briefSpent: number;
};

export class SerpBudget {
  private monthlySpent = 0;
  private dailySpent = 0;
  private dailyKey = '';
  private briefSpent = 0;

  constructor(
    private readonly monthlyCap: number,
    private readonly dailyCap: number,
    private readonly perBriefCap: number,
  ) {}

  private dayKey(): string {
    const d = new Date();
    return `${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`;
  }

  resetBrief(): void {
    this.briefSpent = 0;
  }

  snapshot(): BudgetState {
    return {
      monthlySpent: this.monthlySpent,
      dailySpent: this.dailySpent,
      briefSpent: this.briefSpent,
    };
  }

  canSpend(engine: SerpEngine, cacheHit: boolean): { allowed: boolean; reason?: string } {
    if (cacheHit) return { allowed: true };

    const cost = ENGINE_CREDITS[engine];
    const dk = this.dayKey();
    if (dk !== this.dailyKey) {
      this.dailyKey = dk;
      this.dailySpent = 0;
    }

    if (this.monthlySpent + cost > this.monthlyCap) {
      return { allowed: false, reason: 'monthly_cap' };
    }
    if (this.dailySpent + cost > this.dailyCap) {
      return { allowed: false, reason: 'daily_cap' };
    }
    if (this.briefSpent + cost > this.perBriefCap) {
      return { allowed: false, reason: 'per_brief_cap' };
    }
    return { allowed: true };
  }

  spend(_engine: SerpEngine, credits: number): void {
    this.monthlySpent += credits;
    this.dailySpent += credits;
    this.briefSpent += credits;
  }
}
