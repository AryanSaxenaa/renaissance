import type { BriefClaim, DesignBrief, Fact, Suggestion } from '../../shared/types.js';
import { numeralsGroundedInFacts, numbersIn } from './grounding.js';
import { claimVerifierSchema, designBriefGeneratorSchema } from './schema.js';
import type { DesignBriefGeneratorOutput } from './schema.js';
import { verifierSystemPrompt, verifierUserPrompt } from './prompts.js';
import { chatJson } from '../llm/client.js';

const FORBIDDEN = /\b(safe|guaranteed|legal to copy|free of risk)\b/i;

type ClaimSection = BriefClaim & { section: string; index: number };

function collectClaims(draft: DesignBriefGeneratorOutput): ClaimSection[] {
  const out: ClaimSection[] = [];
  draft.summary.forEach((c, i) => out.push({ ...c, section: 'summary', index: i }));
  draft.mechanism.forEach((c, i) => out.push({ ...c, section: 'mechanism', index: i }));
  draft.marketReality.forEach((c, i) => out.push({ ...c, section: 'marketReality', index: i }));
  draft.risks.forEach((c, i) => out.push({ ...c, section: 'risks', index: i }));
  return out;
}

function factMap(facts: Fact[]): Map<string, Fact> {
  return new Map(facts.map((f) => [f.id, f]));
}

export async function verifyBrief(
  draft: unknown,
  facts: Fact[],
  statusLine: string,
): Promise<DesignBrief> {
  const parsed = designBriefGeneratorSchema.safeParse(draft);
  let removed = 0;
  const empty: DesignBrief = {
    schema: 'design_brief/1',
    summary: [],
    mechanism: [],
    marketReality: [],
    suggestions: [],
    risks: [],
    nextSteps: [],
    statusLine,
    removedByVerifier: 0,
  };
  if (!parsed.success) {
    return { ...empty, removedByVerifier: 1 };
  }

  const fmap = factMap(facts);
  const keepClaim = (c: BriefClaim): boolean => {
    if (FORBIDDEN.test(c.text)) {
      removed += 1;
      return false;
    }
    if (!c.factIds.every((id) => fmap.has(id))) {
      removed += 1;
      return false;
    }
    const cited = c.factIds.map((id) => fmap.get(id)!);
    if (!numeralsGroundedInFacts(c.text, cited)) {
      removed += 1;
      return false;
    }
    return true;
  };

  const filterSection = (claims: BriefClaim[]) => claims.filter((c) => keepClaim(c));

  const suggestions: Suggestion[] = parsed.data.suggestions
    .filter((s) => {
      if (numbersIn(`${s.title} ${s.direction}`).length > 0) {
        removed += 1;
        return false;
      }
      if (FORBIDDEN.test(`${s.title} ${s.direction}`)) {
        removed += 1;
        return false;
      }
      return true;
    })
    .map((s) => ({ ...s, kind: 'suggestion' as const }));

  let summary = filterSection(parsed.data.summary);
  let mechanism = filterSection(parsed.data.mechanism);
  let marketReality = filterSection(parsed.data.marketReality);
  let risks = filterSection(parsed.data.risks);

  const survivingClaims = collectClaims({
    summary: filterSection(parsed.data.summary),
    mechanism: filterSection(parsed.data.mechanism),
    marketReality: filterSection(parsed.data.marketReality),
    risks: filterSection(parsed.data.risks),
    suggestions: parsed.data.suggestions,
    nextSteps: parsed.data.nextSteps,
  });

  try {
    const items = survivingClaims.map((c, i) => ({
      i,
      claim: c.text,
      facts: c.factIds.map((id) => ({ id, text: fmap.get(id)?.text ?? '' })),
    }));
    const llmOut = await chatJson({
      promptId: 'claim_verifier/1',
      system: verifierSystemPrompt(),
      user: verifierUserPrompt(items),
      schema: claimVerifierSchema,
    });
    const unsupported = new Set(
      llmOut.results.filter((r) => r.verdict === 'unsupported').map((r) => r.i),
    );
    const dropUnsupported = (section: BriefClaim[], name: string) =>
      section.filter((c, idx) => {
        const globalIdx = survivingClaims.findIndex((x) => x.section === name && x.text === c.text && x.index === idx);
        if (globalIdx >= 0 && unsupported.has(globalIdx)) {
          removed += 1;
          return false;
        }
        return true;
      });
    summary = dropUnsupported(summary, 'summary');
    mechanism = dropUnsupported(mechanism, 'mechanism');
    marketReality = dropUnsupported(marketReality, 'marketReality');
    risks = dropUnsupported(risks, 'risks');
  } catch {
    // LLM verification unavailable — keep deterministic survivors
  }

  return {
    schema: 'design_brief/1',
    summary,
    mechanism,
    marketReality,
    suggestions,
    risks,
    nextSteps: parsed.data.nextSteps,
    statusLine,
    removedByVerifier: removed,
  };
}
