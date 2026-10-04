import { Router } from 'express';
import { requireScanOwner } from '../guards/owner.js';
import { buildEvidenceBundle } from '../evidence/bundle.js';
import { getStore } from '../store/index.js';

export const evidenceRouter = Router();

evidenceRouter.get('/scans/:id/evidence', async (req, res, next) => {
  try {
    await requireScanOwner(req, res, req.params.id);
    const store = await getStore();
    const scan = await store.getScan(req.params.id);
    res.json({
      scanId: scan?.id,
      statusReport: scan?.statusReport,
      facts: scan?.facts,
      brief: scan?.brief,
    });
  } catch (err) {
    next(err);
  }
});

evidenceRouter.get('/scans/:id/bundle', async (req, res, next) => {
  try {
    await requireScanOwner(req, res, req.params.id);
    const store = await getStore();
    const scan = await store.getScan(req.params.id);
    if (!scan?.statusReport || !scan.brief) {
      return res.status(409).json({ type: 'conflict', title: 'Scan incomplete', detail: 'missing_artifacts' });
    }
    const manifest = await buildEvidenceBundle({
      outDir: `.data/bundles/${scan.id}`,
      projectId: scan.projectId,
      scanId: scan.id,
      mode: scan.mode,
      statusReport: scan.statusReport,
      facts: scan.facts,
      brief: scan.brief,
      receipts: [],
      rawBodies: {},
    });
    res.json({ manifest, path: `.data/bundles/${scan.id}` });
  } catch (err) {
    next(err);
  }
});
