import type { DesignBrief, Fact, StatusReport } from '../../shared/types.js';
import type { SerpReceipt } from '../serpapi/types.js';

export type Owner = { id: string; tokenHash: string; createdAt: string };

export type Project = {
  id: string;
  ownerId: string;
  title: string;
  query: string;
  patentId: string;
  city: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Scan = {
  id: string;
  projectId: string;
  kind: 'initial' | 'rescan';
  mode: 'live' | 'replay';
  status: 'pending' | 'running' | 'complete' | 'failed';
  statusReport?: StatusReport;
  facts: Fact[];
  brief?: DesignBrief;
  removedByVerifier: number;
  credits: number;
  createdAt: string;
};

export interface RenaissanceStore {
  init(): Promise<void>;
  ready(): Promise<boolean>;

  createOwner(tokenHash: string): Promise<Owner>;
  getOwnerByTokenHash(tokenHash: string): Promise<Owner | null>;

  createProject(input: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project>;
  listProjects(ownerId: string): Promise<Project[]>;
  getProject(id: string, ownerId: string): Promise<Project | null>;
  deleteProject(id: string, ownerId: string): Promise<boolean>;

  createScan(input: Omit<Scan, 'id' | 'createdAt'>): Promise<Scan>;
  updateScan(id: string, patch: Partial<Scan>): Promise<Scan>;
  getScan(id: string): Promise<Scan | null>;
  listScansForProject(projectId: string): Promise<Scan[]>;

  recordSerpCall(receipt: SerpReceipt): Promise<void>;
}
