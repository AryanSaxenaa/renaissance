import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import type { SerpReceipt } from '../serpapi/types.js';
import type { Owner, Project, RenaissanceStore, Scan } from './interface.js';

type FileDb = {
  owners: Owner[];
  projects: Project[];
  scans: Scan[];
  serpCalls: SerpReceipt[];
};

const defaultPath = resolve('.data/renaissance-db.json');

export class FileStore implements RenaissanceStore {
  private db: FileDb = { owners: [], projects: [], scans: [], serpCalls: [] };
  private readonly path: string;

  constructor(path = defaultPath) {
    this.path = path;
  }

  async init(): Promise<void> {
    try {
      const raw = await readFile(this.path, 'utf8');
      this.db = JSON.parse(raw) as FileDb;
    } catch {
      await this.persist();
    }
  }

  async ready(): Promise<boolean> {
    return true;
  }

  private async persist(): Promise<void> {
    await mkdir(dirname(this.path), { recursive: true });
    await writeFile(this.path, JSON.stringify(this.db, null, 2), 'utf8');
  }

  async createOwner(tokenHash: string): Promise<Owner> {
    const owner: Owner = { id: randomUUID(), tokenHash, createdAt: new Date().toISOString() };
    this.db.owners.push(owner);
    await this.persist();
    return owner;
  }

  async getOwnerByTokenHash(tokenHash: string): Promise<Owner | null> {
    return this.db.owners.find((o) => o.tokenHash === tokenHash) ?? null;
  }

  async createProject(input: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    const now = new Date().toISOString();
    const project: Project = { ...input, id: randomUUID(), createdAt: now, updatedAt: now };
    this.db.projects.push(project);
    await this.persist();
    return project;
  }

  async listProjects(ownerId: string): Promise<Project[]> {
    return this.db.projects.filter((p) => p.ownerId === ownerId);
  }

  async getProject(id: string, ownerId: string): Promise<Project | null> {
    const p = this.db.projects.find((x) => x.id === id && x.ownerId === ownerId);
    return p ?? null;
  }

  async deleteProject(id: string, ownerId: string): Promise<boolean> {
    const idx = this.db.projects.findIndex((p) => p.id === id && p.ownerId === ownerId);
    if (idx < 0) return false;
    this.db.projects.splice(idx, 1);
    this.db.scans = this.db.scans.filter((s) => s.projectId !== id);
    await this.persist();
    return true;
  }

  async createScan(input: Omit<Scan, 'id' | 'createdAt'>): Promise<Scan> {
    const scan: Scan = { ...input, id: randomUUID(), createdAt: new Date().toISOString() };
    this.db.scans.push(scan);
    await this.persist();
    return scan;
  }

  async updateScan(id: string, patch: Partial<Scan>): Promise<Scan> {
    const scan = this.db.scans.find((s) => s.id === id);
    if (!scan) throw new Error('scan_not_found');
    Object.assign(scan, patch);
    await this.persist();
    return scan;
  }

  async getScan(id: string): Promise<Scan | null> {
    return this.db.scans.find((s) => s.id === id) ?? null;
  }

  async listScansForProject(projectId: string): Promise<Scan[]> {
    return this.db.scans.filter((s) => s.projectId === projectId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async recordSerpCall(receipt: SerpReceipt): Promise<void> {
    this.db.serpCalls.push(receipt);
    await this.persist();
  }
}
