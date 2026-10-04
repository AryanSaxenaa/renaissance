import { Router } from 'express';
import { z } from 'zod';
import { assertLiveAccess } from '../guards/accessCode.js';
import { scanRateLimit } from '../guards/rateLimit.js';
import { ensureOwner, requireScanOwner } from '../guards/owner.js';
import { isAllowedCity } from '../market/maps.js';
import { getConfig } from '../config.js';
import { runDossierScan } from '../scans/runner.js';
import { getStore } from '../store/index.js';
import { diffScans } from '../diff.js';

const createSchema = z.object({
  patentId: z.string().min(1),
  query: z.string().min(1).max(120),
  city: z.string().min(1),
  title: z.string().optional(),
});

export const scansRouter = Router();

scansRouter.post('/scans', scanRateLimit, async (req, res, next) => {
  try {
    assertLiveAccess(req);
    const body = createSchema.parse(req.body);
    if (!isAllowedCity(body.city)) {
      return res.status(400).json({ type: 'validation', title: 'Invalid city', detail: 'city_not_allowed' });
    }
    const owner = await ensureOwner(req, res);
    const store = await getStore();
    const config = getConfig();
    const project = await store.createProject({
      ownerId: owner.id,
      title: body.title ?? body.query,
      query: body.query,
      patentId: body.patentId,
      city: body.city,
    });
    const scan = await store.createScan({
      projectId: project.id,
      kind: 'initial',
      mode: config.mode === 'live' ? 'live' : 'replay',
      status: 'pending',
      facts: [],
      removedByVerifier: 0,
      credits: 0,
    });
    void runDossierScan({
      scanId: scan.id,
      projectId: project.id,
      patentId: body.patentId,
      query: body.query,
      city: body.city,
    }).catch(() => undefined);
    res.status(202).json({ scanId: scan.id, projectId: project.id });
  } catch (err) {
    next(err);
  }
});

scansRouter.get('/scans/:id', async (req, res, next) => {
  try {
    const scanId = String(req.params.id);
    await requireScanOwner(req, res, scanId);
    const store = await getStore();
    const scan = await store.getScan(scanId);
    res.json(scan);
  } catch (err) {
    next(err);
  }
});

scansRouter.post('/projects/:id/rescan', scanRateLimit, async (req, res, next) => {
  try {
    assertLiveAccess(req);
    const owner = await ensureOwner(req, res);
    const store = await getStore();
    const projectId = String(req.params.id);
    const project = await store.getProject(projectId, owner.id);
    if (!project) return res.status(404).json({ type: 'not_found', title: 'Not found', detail: 'project' });
    const config = getConfig();
    const scan = await store.createScan({
      projectId: project.id,
      kind: 'rescan',
      mode: config.mode === 'live' ? 'live' : 'replay',
      status: 'pending',
      facts: [],
      removedByVerifier: 0,
      credits: 0,
    });
    void runDossierScan({
      scanId: scan.id,
      projectId: project.id,
      patentId: project.patentId,
      query: project.query,
      city: project.city ?? 'Pune',
      noCache: true,
    }).catch(() => undefined);
    res.status(202).json({ scanId: scan.id });
  } catch (err) {
    next(err);
  }
});

scansRouter.get('/projects/:id/diff', async (req, res, next) => {
  try {
    const owner = await ensureOwner(req, res);
    const store = await getStore();
    const projectId = String(req.params.id);
    const project = await store.getProject(projectId, owner.id);
    if (!project) return res.status(404).json({ type: 'not_found', title: 'Not found', detail: 'project' });
    const scans = await store.listScansForProject(project.id);
    if (scans.length < 2) return res.json({ diff: [] });
    const diff = diffScans(scans[1], scans[0]);
    res.json({ diff });
  } catch (err) {
    next(err);
  }
});
