import { timingSafeEqual } from 'node:crypto';
import type { Request } from 'express';
import { getConfig } from '../config.js';

export function accessCodeRequired(): boolean {
  const config = getConfig();
  return Boolean(config.PUBLIC_DEMO_MODE);
}

export function verifyAccessCode(req: Request): boolean {
  const config = getConfig();
  const expected = config.ACCESS_CODE ?? '';
  const provided = String(req.header('x-access-code') ?? '');
  if (!expected || !provided) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(provided);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function assertLiveAccess(req: Request): void {
  const config = getConfig();
  if (config.mode === 'replay') return;
  if (!accessCodeRequired()) return;
  if (!verifyAccessCode(req)) {
    const err = new Error('access_code_required');
    (err as Error & { status: number }).status = 401;
    throw err;
  }
}
