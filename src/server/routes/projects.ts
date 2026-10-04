import { Router } from 'express';
import { ensureOwner } from '../guards/owner.js';
import { getStore } from '../store/index.js';

export const projectsRouter = Router();

projectsRouter.get('/projects', async (req, res, next) => {
  try {
    const owner = await ensureOwner(req, res);
    const store = await getStore();
    const projects = await store.listProjects(owner.id);
    res.json({ projects });
  } catch (err) {
    next(err);
  }
});

projectsRouter.get('/projects/:id', async (req, res, next) => {
  try {
    const owner = await ensureOwner(req, res);
    const store = await getStore();
    const project = await store.getProject(req.params.id, owner.id);
    if (!project) return res.status(404).json({ type: 'not_found', title: 'Not found', detail: 'project' });
    const scans = await store.listScansForProject(project.id);
    res.json({ project, scans });
  } catch (err) {
    next(err);
  }
});

projectsRouter.delete('/projects/:id', async (req, res, next) => {
  try {
    const owner = await ensureOwner(req, res);
    const store = await getStore();
    const ok = await store.deleteProject(req.params.id, owner.id);
    if (!ok) return res.status(404).json({ type: 'not_found', title: 'Not found', detail: 'project' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
