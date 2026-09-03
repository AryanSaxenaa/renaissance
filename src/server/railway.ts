import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { getPatentDiligenceBrief, searchGooglePatents } from './renaissance/patents';
import { analyzeMechanicalGaps, analyzePatentWithGemini, generateBlueprintImage } from './renaissance/gemini';

type Project = {
  _id: string;
  title: string;
  description: string;
  sourcePatentId: string;
  sourcePatentTitle: string;
  status: 'draft' | 'analyzing' | 'remixed' | 'archived';
  blueprintSvg: string;
  blueprintImageBase64: string;
  modernizations: Awaited<ReturnType<typeof analyzePatentWithGemini>>['modernizations'];
  properties: Awaited<ReturnType<typeof analyzePatentWithGemini>>['properties'];
  thoughtLog: Awaited<ReturnType<typeof analyzePatentWithGemini>>['thoughtLog'];
  materialUpdates: unknown[];
  createdAt: string;
  updatedAt: string;
};

// Keep the demo usable after a process restart. Railway's filesystem is still
// ephemeral between deployments, so Supabase can be added later for durable
// multi-instance storage without changing the API contract.
const projectStorePath = resolve(process.env.PROJECT_STORE_PATH || '.data/renaissance-projects.json');
const projects = new Map<string, Project>();
if (existsSync(projectStorePath)) {
  try {
    const savedProjects = JSON.parse(readFileSync(projectStorePath, 'utf8')) as Project[];
    for (const project of savedProjects) projects.set(project._id, project);
  } catch (error) {
    console.warn('[Renaissance API] Could not restore project store:', error);
  }
}
const searchHistory: Array<{ _id: string; query: string; resultsCount: number; createdAt: string }> = [];

function persistProjects() {
  try {
    mkdirSync(dirname(projectStorePath), { recursive: true });
    writeFileSync(projectStorePath, JSON.stringify([...projects.values()]), 'utf8');
  } catch (error) {
    console.warn('[Renaissance API] Could not persist project store:', error);
  }
}

function blueprintSvg(division: string) {
  return `<svg viewBox="0 0 800 450" xmlns="http://www.w3.org/2000/svg"><rect width="800" height="450" fill="#08243d"/><g fill="none" stroke="#9eeaf2" stroke-width="2"><circle cx="400" cy="225" r="120"/><circle cx="400" cy="225" r="55"/><path d="M180 225h440M400 80v290" stroke-dasharray="8 6"/><rect x="250" y="145" width="300" height="160"/></g><text x="24" y="30" fill="#9eeaf2" font-family="monospace" font-size="14">${division} // SYNTHETIC BLUEPRINT</text></svg>`;
}

function publicProject(project: Project) {
  return project;
}

const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: '8mb' }));

app.get('/health', (_req, res) => res.json({ ok: true, service: 'renaissance-api' }));

app.post('/api/query/renaissance/:method', async (req, res, next) => {
  try {
    const { method } = req.params;
    if (method === 'searchPatents') {
      const query = String(req.body?.query || '').trim();
      if (!query) return res.json({ data: [] });
      const results = await searchGooglePatents(query, { maxResults: 10, onlyExpired: true, beforeYear: 2005 });
      searchHistory.unshift({ _id: randomUUID(), query, resultsCount: results.length, createdAt: new Date().toISOString() });
      return res.json({ data: results.map((p) => ({ ...p, filingYear: p.filingDate.getFullYear() })) });
    }
    if (method === 'getPatentDiligence') {
      return res.json({ data: await getPatentDiligenceBrief(req.body) });
    }
    if (method === 'getSearchHistory') return res.json({ data: searchHistory.slice(0, 20) });
    if (method === 'getArxivPapers') return res.json({ data: [] });
    if (method === 'getProjects') {
      return res.json({ data: [...projects.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((p) => ({ ...p, materialUpdatesCount: p.materialUpdates.length })) });
    }
    if (method === 'getProject') {
      const project = projects.get(String(req.body?.projectId));
      if (!project) return res.status(404).json({ error: 'Project not found. The project may have been created before the API restarted.' });
      return res.json({ data: publicProject(project) });
    }
    if (method === 'analyzePatentPreview') {
      const result = await analyzeMechanicalGaps({ patentId: String(req.body?.patentId || 'UNKNOWN'), title: String(req.body?.title || 'Untitled patent'), abstract: String(req.body?.abstract || ''), claims: ['Patent analysis request'] });
      return res.json({ data: { patentId: req.body.patentId, overallAssessment: result.overallAssessment, topGap: result.gaps[0] || null, modernizationPotential: result.gaps.length >= 3 ? 'HIGH' : result.gaps.length >= 2 ? 'MEDIUM' : 'LOW' } });
    }
    return res.status(404).json({ error: `Unknown query: ${method}` });
  } catch (error) { next(error); }
});

app.post('/api/mutation/renaissance/:method', async (req, res, next) => {
  try {
    const { method } = req.params;
    if (method === 'createRemixProject') {
      const { patentId, title, abstract, claims = [], division, expiryYear } = req.body;
      const analysis = await analyzePatentWithGemini({ patentId, title, abstract, claims, division, expiryYear });
      const image = await generateBlueprintImage({ title, abstract, division }, analysis.modernizations);
      const now = new Date().toISOString();
      const project: Project = { _id: randomUUID(), title: `Modernized: ${title}`, description: `AI-generated modernization of expired patent ${patentId}`, sourcePatentId: patentId, sourcePatentTitle: title, status: 'remixed', blueprintSvg: blueprintSvg(division), blueprintImageBase64: image.imageBase64 || '', modernizations: analysis.modernizations, properties: analysis.properties, thoughtLog: analysis.thoughtLog, materialUpdates: [], createdAt: now, updatedAt: now };
      projects.set(project._id, project);
      persistProjects();
      return res.json({ data: { projectId: project._id, hasBlueprintImage: Boolean(image.imageBase64) } });
    }
    const project = projects.get(String(req.body?.projectId));
    if (!project) return res.status(404).json({ error: 'Project not found. The project may have been created before the API restarted.' });
    if (method === 'updateProject') { Object.assign(project, { ...(req.body.title ? { title: req.body.title } : {}), ...(req.body.description ? { description: req.body.description } : {}), ...(req.body.status ? { status: req.body.status } : {}), updatedAt: new Date().toISOString() }); persistProjects(); return res.json({ data: { success: true } }); }
    if (method === 'deleteProject') { projects.delete(project._id); persistProjects(); return res.json({ data: { success: true } }); }
    return res.status(404).json({ error: `Unknown mutation: ${method}` });
  } catch (error) { next(error); }
});

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Renaissance API]', error);
  res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`[Renaissance API] listening on ${port}`));
