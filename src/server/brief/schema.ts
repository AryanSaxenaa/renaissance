import { z } from 'zod';

export const briefClaimSchema = z.object({
  text: z.string().max(300),
  factIds: z.array(z.string()).min(1),
});

export const suggestionSchema = z.object({
  title: z.string().max(80),
  component: z.string().max(80),
  direction: z.string().max(280),
  assumptions: z.array(z.string()).max(3),
  factIds: z.array(z.string()),
  engineeringJudgement: z.boolean(),
});

export const designBriefGeneratorSchema = z.object({
  summary: z.array(briefClaimSchema).max(3),
  mechanism: z.array(briefClaimSchema).max(4),
  marketReality: z.array(briefClaimSchema).max(5),
  suggestions: z.array(suggestionSchema).max(3),
  risks: z.array(briefClaimSchema).max(5),
  nextSteps: z.array(z.string().max(160)).max(5),
});

export const claimVerifierSchema = z.object({
  results: z.array(
    z.object({
      i: z.number().int(),
      verdict: z.enum(['supported', 'partial', 'unsupported']),
      note: z.string().max(160).optional(),
    }),
  ),
});

export const designBriefSchema = designBriefGeneratorSchema.extend({
  schema: z.literal('design_brief/1'),
  statusLine: z.string(),
  removedByVerifier: z.number().int().nonnegative(),
});

export type DesignBriefGeneratorOutput = z.infer<typeof designBriefGeneratorSchema>;
export type ClaimVerifierOutput = z.infer<typeof claimVerifierSchema>;

export const designBriefJsonSchema = {
  $id: 'design_brief_generator/1',
  type: 'object',
  additionalProperties: false,
  required: ['summary', 'mechanism', 'marketReality', 'suggestions', 'risks', 'nextSteps'],
  properties: {
    summary: { type: 'array', maxItems: 3, items: { $ref: '#/$defs/claim' } },
    mechanism: { type: 'array', maxItems: 4, items: { $ref: '#/$defs/claim' } },
    marketReality: { type: 'array', maxItems: 5, items: { $ref: '#/$defs/claim' } },
    risks: { type: 'array', maxItems: 5, items: { $ref: '#/$defs/claim' } },
    suggestions: { type: 'array', maxItems: 3 },
    nextSteps: { type: 'array', maxItems: 5, items: { type: 'string', maxLength: 160 } },
  },
  $defs: {
    claim: {
      type: 'object',
      additionalProperties: false,
      required: ['text', 'factIds'],
      properties: {
        text: { type: 'string', maxLength: 300 },
        factIds: { type: 'array', minItems: 1, items: { type: 'string' } },
      },
    },
  },
};
