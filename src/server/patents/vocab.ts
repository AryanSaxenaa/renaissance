import type { LegalCategory } from './types.js';

const STATUS_MAP: Record<string, LegalCategory> = {
  active: 'ACTIVE',
  Active: 'ACTIVE',
  ACTIVE: 'ACTIVE',
  granted: 'ACTIVE',
  'not active': 'NON_ACTIVE',
  'Not Active': 'NON_ACTIVE',
  NOT_ACTIVE: 'NON_ACTIVE',
  expired: 'NON_ACTIVE',
  Expired: 'NON_ACTIVE',
  lapsed: 'NON_ACTIVE',
  abandoned: 'NON_ACTIVE',
  pending: 'PENDING',
  Pending: 'PENDING',
  PENDING: 'PENDING',
  application: 'PENDING',
};

const CLOSING_EVENT_CODES = new Set([
  'EXP',
  'EXPX',
  'LAPSE',
  'LAPSED',
  'ABANDON',
  'WITHDRAWN',
  'CEASED',
  'NOT_IN_FORCE',
]);

const FEE_EVENT_CODES = new Set(['FEE', 'MAINTENANCE', 'RENEWAL', 'FEE_PAYMENT']);

export function normaliseLegalStatus(raw: string | undefined): { cat: LegalCategory; unrecognised?: string } {
  if (!raw || raw.trim() === '') return { cat: 'UNKNOWN' };
  const trimmed = raw.trim();
  const mapped = STATUS_MAP[trimmed];
  if (mapped) return { cat: mapped };
  const lower = trimmed.toLowerCase();
  for (const [k, v] of Object.entries(STATUS_MAP)) {
    if (k.toLowerCase() === lower) return { cat: v };
  }
  return { cat: 'UNKNOWN', unrecognised: trimmed };
}

export function isClosingEvent(code: string | undefined, title: string | undefined): boolean {
  const c = (code ?? '').toUpperCase();
  if (CLOSING_EVENT_CODES.has(c)) return true;
  const t = (title ?? '').toLowerCase();
  return t.includes('expir') || t.includes('lapse') || t.includes('ceased') || t.includes('not in force');
}

export function isFeeEvent(code: string | undefined, title: string | undefined): boolean {
  const c = (code ?? '').toUpperCase();
  if (FEE_EVENT_CODES.has(c)) return true;
  const t = (title ?? '').toLowerCase();
  return t.includes('fee') || t.includes('maintenance') || t.includes('renewal');
}

export function mapCountryStatus(status: string | undefined): LegalCategory | null {
  if (!status) return null;
  const s = status.toUpperCase();
  if (s.includes('NOT') && s.includes('ACTIVE')) return 'NON_ACTIVE';
  if (s === 'ACTIVE' || s.includes('IN FORCE')) return 'ACTIVE';
  if (s.includes('PENDING')) return 'PENDING';
  return null;
}
