import { Router } from 'express';
import { getConfig } from '../config.js';
import { getStore } from '../store/index.js';

export const healthRouter = Router();

healthRouter.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'renaissance' });
});

healthRouter.get('/health/ready', async (_req, res) => {
  try {
    getConfig();
    const store = await getStore();
    const dbOk = await store.ready();
    if (!dbOk) return res.status(503).json({ ok: false, reason: 'store' });
    res.json({ ok: true });
  } catch (err) {
    res.status(503).json({ ok: false, reason: String(err) });
  }
});
