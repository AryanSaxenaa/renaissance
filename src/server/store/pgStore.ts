import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import type { SerpReceipt } from '../serpapi/types.js';
import type { Owner, Project, RenaissanceStore, Scan } from './interface.js';

export class PgStore implements RenaissanceStore {
  private pool: pg.Pool;

  constructor(databaseUrl: string) {
    this.pool = new pg.Pool({ connectionString: databaseUrl });
  }

  async init(): Promise<void> {
    const here = dirname(fileURLToPath(import.meta.url));
    const sql = await readFile(join(here, 'migrations', '001.sql'), 'utf8');
    await this.pool.query(sql);
  }

  async ready(): Promise<boolean> {
    try {
      await this.pool.query('select 1');
      return true;
    } catch {
      return false;
    }
  }

  async createOwner(tokenHash: string): Promise<Owner> {
    const id = randomUUID();
    const createdAt = new Date().toISOString();
    await this.pool.query('insert into owners (id, token_hash) values ($1, $2)', [id, tokenHash]);
    return { id, tokenHash, createdAt };
  }

  async getOwnerByTokenHash(tokenHash: string): Promise<Owner | null> {
    const res = await this.pool.query('select id, token_hash, created_at from owners where token_hash = $1 limit 1', [
      tokenHash,
    ]);
    if (res.rowCount === 0) return null;
    const row = res.rows[0];
    return { id: row.id, tokenHash: row.token_hash, createdAt: row.created_at.toISOString() };
  }

  async createProject(input: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    const id = randomUUID();
    const res = await this.pool.query(
      `insert into projects (id, owner_id, title, query, patent_id, city)
       values ($1,$2,$3,$4,$5,$6) returning created_at, updated_at`,
      [id, input.ownerId, input.title, input.query, input.patentId, input.city],
    );
    return {
      id,
      ...input,
      createdAt: res.rows[0].created_at.toISOString(),
      updatedAt: res.rows[0].updated_at.toISOString(),
    };
  }

  async listProjects(ownerId: string): Promise<Project[]> {
    const res = await this.pool.query(
      'select * from projects where owner_id = $1 order by updated_at desc',
      [ownerId],
    );
    return res.rows.map(rowToProject);
  }

  async getProject(id: string, ownerId: string): Promise<Project | null> {
    const res = await this.pool.query('select * from projects where id = $1 and owner_id = $2', [id, ownerId]);
    if (res.rowCount === 0) return null;
    return rowToProject(res.rows[0]);
  }

  async deleteProject(id: string, ownerId: string): Promise<boolean> {
    const res = await this.pool.query('delete from projects where id = $1 and owner_id = $2', [id, ownerId]);
    return (res.rowCount ?? 0) > 0;
  }

  async createScan(input: Omit<Scan, 'id' | 'createdAt'>): Promise<Scan> {
    const id = randomUUID();
    await this.pool.query(
      `insert into scans (id, project_id, kind, mode, status, status_report, facts, brief, removed_by_verifier, credits)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [
        id,
        input.projectId,
        input.kind,
        input.mode,
        input.status,
        input.statusReport ? JSON.stringify(input.statusReport) : null,
        JSON.stringify(input.facts),
        input.brief ? JSON.stringify(input.brief) : null,
        input.removedByVerifier,
        input.credits,
      ],
    );
    return { ...input, id, createdAt: new Date().toISOString() };
  }

  async updateScan(id: string, patch: Partial<Scan>): Promise<Scan> {
    const existing = await this.getScan(id);
    if (!existing) throw new Error('scan_not_found');
    const merged = { ...existing, ...patch };
    await this.pool.query(
      `update scans set status=$2, status_report=$3, facts=$4, brief=$5, removed_by_verifier=$6, credits=$7 where id=$1`,
      [
        id,
        merged.status,
        merged.statusReport ? JSON.stringify(merged.statusReport) : null,
        JSON.stringify(merged.facts),
        merged.brief ? JSON.stringify(merged.brief) : null,
        merged.removedByVerifier,
        merged.credits,
      ],
    );
    return merged;
  }

  async getScan(id: string): Promise<Scan | null> {
    const res = await this.pool.query('select * from scans where id = $1', [id]);
    if (res.rowCount === 0) return null;
    return rowToScan(res.rows[0]);
  }

  async listScansForProject(projectId: string): Promise<Scan[]> {
    const res = await this.pool.query('select * from scans where project_id = $1 order by created_at desc', [
      projectId,
    ]);
    return res.rows.map(rowToScan);
  }

  async recordSerpCall(receipt: SerpReceipt): Promise<void> {
    await this.pool.query(
      `insert into serpapi_calls (id, scan_id, patent_id, engine, params_redacted, search_metadata_id, json_endpoint, http_status, credits, cache_hit, latency_ms, raw_key, sha256_raw)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
      [
        receipt.callId,
        receipt.scanId ?? null,
        receipt.patentId ?? null,
        receipt.engine,
        JSON.stringify(receipt.paramsRedacted),
        receipt.searchMetadataId,
        receipt.jsonEndpoint,
        receipt.httpStatus,
        receipt.credits,
        receipt.cacheHit,
        receipt.latencyMs,
        receipt.rawKey,
        receipt.sha256Raw,
      ],
    );
  }
}

function rowToProject(row: Record<string, unknown>): Project {
  return {
    id: String(row.id),
    ownerId: String(row.owner_id),
    title: String(row.title),
    query: String(row.query),
    patentId: String(row.patent_id),
    city: row.city ? String(row.city) : null,
    createdAt: (row.created_at as Date).toISOString(),
    updatedAt: (row.updated_at as Date).toISOString(),
  };
}

function rowToScan(row: Record<string, unknown>): Scan {
  return {
    id: String(row.id),
    projectId: String(row.project_id),
    kind: row.kind as Scan['kind'],
    mode: row.mode as Scan['mode'],
    status: row.status as Scan['status'],
    statusReport: row.status_report as Scan['statusReport'],
    facts: (row.facts as Scan['facts']) ?? [],
    brief: row.brief as Scan['brief'],
    removedByVerifier: Number(row.removed_by_verifier ?? 0),
    credits: Number(row.credits ?? 0),
    createdAt: (row.created_at as Date).toISOString(),
  };
}
