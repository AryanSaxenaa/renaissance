import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { type Express } from 'express';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { getConfig } from './config.js';
import { logger } from './logger.js';
import { configRouter } from './routes/configRoute.js';
import { evidenceRouter } from './routes/evidence.js';
import { healthRouter } from './routes/health.js';
import { projectsRouter } from './routes/projects.js';
import { scansRouter } from './routes/scans.js';
import { searchRouter } from './routes/search.js';
import { searchPatents } from './patents/search.js';
import { SerpClient } from './serpapi/client.js';

export function createApp(): Express {
  const app = express();
  const config = getConfig();

  const origins = config.CORS_ORIGINS?.split(',').map((s) => s.trim()).filter(Boolean);
  if (origins?.length) {
    app.use(cors({ origin: origins, credentials: true }));
  } else if (config.NODE_ENV !== 'production') {
    app.use(cors({ origin: true, credentials: true }));
  }

  app.use(express.json({ limit: '256kb' }));
  app.use(cookieParser());
  app.use(healthRouter);

  const v1 = express.Router();
  v1.use(configRouter);
  v1.use(searchRouter);
  v1.use(scansRouter);
  v1.use(projectsRouter);
  v1.use(evidenceRouter);
  app.use('/api/v1', v1);

  registerCompatShim(app);

  const clientDist = resolve('dist/client');
  if (config.NODE_ENV === 'production' && existsSync(clientDist)) {
    app.use(express.static(clientDist));
    app.get('*', (req: express.Request, res: express.Response, next: express.NextFunction) => {
      if (req.path.startsWith('/api')) return next();
      res.sendFile(resolve(clientDist, 'index.html'));
    });
  }

  app.use((err: Error & { status?: number }, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const status = err.status ?? 500;
    logger.error({ err: err.message, status }, 'request_error');
    res.status(status).json({
      type: 'about:blank',
      title: err.message,
      detail: err.message,
    });
  });

  return app;
}

function registerCompatShim(app: Express): void {
  app.post('/api/query/renaissance/:method', async (req, res, next) => {
    try {
      const { method } = req.params;
      if (method === 'searchPatents') {
        const query = String(req.body?.query || '').trim();
        if (!query) return res.json({ data: [] });
        const client = new SerpClient();
        const { hits } = await searchPatents(client, query);
        return res.json({
          data: hits.map((p) => ({
            ...p,
            filingYear: p.filing_date ? new Date(p.filing_date).getFullYear() : undefined,
          })),
        });
      }
      if (method === 'getArxivPapers') return res.json({ data: [] });
      if (method === 'getSearchHistory') return res.json({ data: [] });
      if (method === 'getProjects') return res.json({ data: [] });
      return res.status(404).json({ error: `compat_method_${method}_use_rest` });
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/mutation/renaissance/:method', async (req, res) => {
    res.status(501).json({ error: `compat_mutation_${req.params.method}_use_rest` });
  });
}
