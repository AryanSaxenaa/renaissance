import { z } from 'zod';
import type { PatentDetails } from '../src/server/patents/types.js';

export const humanStatusSchema = z.enum([
  'expired_term',
  'lapsed_fee',
  'in_force',
  'related_active',
  'unknown',
]);

export type HumanStatus = z.infer<typeof humanStatusSchema>;

export const evalLabelSchema = z.object({
  id: z.string(),
  patentId: z.string(),
  humanStatus: humanStatusSchema,
  synthetic: z.boolean().optional(),
  now: z.string().optional(),
  country_status: z.record(z.string(), z.string()).optional(),
  details: z.custom<PatentDetails>(),
  notes: z.string().optional(),
});

export type EvalLabel = z.infer<typeof evalLabelSchema>;

export function engineSaysFree(headline: string): boolean {
  return headline === 'LIKELY_FREE';
}

export function humanSaysFree(status: HumanStatus): boolean {
  return status === 'expired_term' || status === 'lapsed_fee';
}

export function humanSaysInForce(status: HumanStatus): boolean {
  return status === 'in_force' || status === 'related_active';
}

export function headlineFromHuman(status: HumanStatus): string {
  switch (status) {
    case 'in_force':
      return 'IN_FORCE';
    case 'related_active':
      return 'RELATED_ACTIVE';
    case 'expired_term':
    case 'lapsed_fee':
      return 'LIKELY_FREE';
    default:
      return 'UNCERTAIN';
  }
}
