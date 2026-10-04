import { Router } from 'express';
import { getConfig } from '../config.js';
import { SerpClient } from '../serpapi/client.js';

export const configRouter = Router();

configRouter.get('/config', (_req, res) => {
  const config = getConfig();
  const client = new SerpClient();
  res.json({
    mode: config.mode,
    serpapiEnabled: config.serpapiEnabled,
    limits: {
      dailyCreditCap: config.DAILY_CREDIT_CAP,
      monthlyHardCap: config.SERPAPI_MONTHLY_HARD_CAP,
      perBriefCap: config.PER_BRIEF_CREDIT_CAP,
    },
    remainingCredits: {
      monthly: config.SERPAPI_MONTHLY_HARD_CAP - client.budget.snapshot().monthlySpent,
    },
  });
});

configRouter.get('/budget', (_req, res) => {
  const client = new SerpClient();
  res.json({ ledger: client.budget.snapshot() });
});
