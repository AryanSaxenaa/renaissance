import { createHash, randomBytes } from 'node:crypto';
import type { Request, Response } from 'express';
import { getConfig } from '../config.js';
import { getStore } from '../store/index.js';
import type { Owner } from '../store/interface.js';

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export async function ensureOwner(req: Request, res: Response): Promise<Owner> {
  const config = getConfig();
  const store = await getStore();
  const cookieName = config.OWNER_COOKIE_NAME;
  let token = req.cookies?.[cookieName] as string | undefined;
  if (!token) {
    token = randomBytes(32).toString('hex');
    res.cookie(cookieName, token, { httpOnly: true, sameSite: 'lax', secure: config.NODE_ENV === 'production' });
  }
  const tokenHash = hashToken(token);
  let owner = await store.getOwnerByTokenHash(tokenHash);
  if (!owner) {
    owner = await store.createOwner(tokenHash);
  }
  return owner;
}

export async function requireScanOwner(req: Request, res: Response, scanId: string): Promise<Owner> {
  const owner = await ensureOwner(req, res);
  const store = await getStore();
  const scan = await store.getScan(scanId);
  if (!scan) {
    const err = new Error('not_found');
    (err as Error & { status: number }).status = 404;
    throw err;
  }
  const project = await store.getProject(scan.projectId, owner.id);
  if (!project) {
    const err = new Error('not_found');
    (err as Error & { status: number }).status = 404;
    throw err;
  }
  return owner;
}
