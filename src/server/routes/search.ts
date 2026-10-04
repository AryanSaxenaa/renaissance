import { Router } from 'express';
import { z } from 'zod';
import { assertLiveAccess } from '../guards/accessCode.js';
import { searchRateLimit } from '../guards/rateLimit.js';
import { isAllowedCity } from '../market/maps.js';
import { searchPatents } from '../patents/search.js';
import { SerpClient } from '../serpapi/client.js';

const querySchema = z.object({
  q: z.string().min(1).max(120),
  city: z.string().optional(),
});

export const searchRouter = Router();

searchRouter.get('/search', searchRateLimit, async (req, res, next) => {
  try {
    assertLiveAccess(req);
    const parsed = querySchema.parse({ q: req.query.q, city: req.query.city });
    if (parsed.city && !isAllowedCity(parsed.city)) {
      return res.status(400).json({ type: 'validation', title: 'Invalid city', detail: 'city_not_allowed' });
    }
    const client = new SerpClient();
    const { hits, callId, searchMetadataId } = await searchPatents(client, parsed.q);
    res.json({ hits, receipt: { callId, searchMetadataId } });
  } catch (err) {
    next(err);
  }
});

searchRouter.post('/estimate', (req, res) => {
  const kind = String(req.body?.kind ?? 'dossier');
  const credits = kind === 'search' ? 1 : 6;
  res.json({ credits, kind });
});
