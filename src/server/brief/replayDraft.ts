import type { Fact } from '../../shared/types.js';
import type { DesignBriefGeneratorOutput } from './schema.js';

function pickFacts(facts: Fact[], kind: Fact['kind'], limit: number): Fact[] {
  return facts.filter((f) => f.kind === kind).slice(0, limit);
}

/** Deterministic brief draft for replay when LLM fixtures are absent (no invented numerals). */
export function buildReplayDraftFromFacts(facts: Fact[]): DesignBriefGeneratorOutput {
  const status = pickFacts(facts, 'status', 2);
  const patentText = pickFacts(facts, 'patent_text', 2);
  const market = pickFacts(facts, 'market', 3);
  const makers = pickFacts(facts, 'maker', 2);
  const papers = pickFacts(facts, 'paper', 2);

  const summary: DesignBriefGeneratorOutput['summary'] = [];
  if (status[0]) {
    summary.push({ text: status[0].text, factIds: [status[0].id] });
  }
  if (patentText[0] && summary.length < 3) {
    summary.push({ text: patentText[0].text, factIds: [patentText[0].id] });
  }

  const mechanism = patentText.slice(0, 2).map((f) => ({ text: f.text, factIds: [f.id] }));

  const marketReality = [...market, ...makers].slice(0, 4).map((f) => ({
    text: f.text,
    factIds: [f.id],
  }));

  const risks: DesignBriefGeneratorOutput['risks'] = [];
  const notChecked = facts.find((f) => f.key === 'status.not_checked');
  if (notChecked) {
    risks.push({ text: notChecked.text, factIds: [notChecked.id] });
  }

  const suggestions: DesignBriefGeneratorOutput['suggestions'] = [];
  const motivator = patentText[0] ?? status[0];
  if (motivator) {
    suggestions.push({
      title: 'Material refresh',
      component: 'Primary structure',
      direction: 'Consider modern alloys or composites where loads allow, after independent stress review.',
      assumptions: ['Loads similar to original design intent', 'Manufacturing constraints unknown'],
      factIds: [motivator.id],
      engineeringJudgement: true,
    });
  }

  const nextSteps = [
    'Confirm status with counsel before production use.',
    papers.length ? 'Review cited literature for recent mechanism variants.' : 'Search for recent literature on the mechanism.',
    'Validate market listings against your target product category.',
  ];

  return {
    summary,
    mechanism,
    marketReality,
    risks,
    suggestions,
    nextSteps,
  };
}
