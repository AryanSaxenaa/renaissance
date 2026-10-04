import type { Fact } from '../../shared/types.js';

export function generatorSystemPrompt(): string {
  return `You write a one-page design brief for an engineer, using ONLY the facts provided.
Rules:
1. Every sentence you write in summary, mechanism, marketReality and risks MUST list the ids of the facts it relies on (factIds).
2. Do not write any number, percentage, unit value or date unless it appears in a cited fact's text. If unsure, omit the number.
3. Do not state legal status. A separate system writes the status line.
4. Suggestions are ideas, not findings: give 1-3 at most; no numbers; list assumptions; say what fact motivated each (factIds) or set engineeringJudgement=true.
5. Do not use the words: safe, guaranteed, legal to copy, free of risk.
6. Output JSON only matching the schema.`;
}

export function generatorUserPrompt(query: string, facts: Fact[]): string {
  const trimmed = [...facts]
    .sort((a, b) => a.kind.localeCompare(b.kind) || a.text.length - b.text.length)
    .slice(0, 40)
    .map((f) => ({ id: f.id, kind: f.kind, text: f.text }));
  return `QUERY: ${query}\nFACTS: ${JSON.stringify(trimmed)}`;
}

export function verifierSystemPrompt(): string {
  return `You check claims against facts. For each claim, using ONLY its cited facts, answer whether the cited facts support it.
"supported" = facts state it or directly imply it. "partial" = only some of it. "unsupported" = not stated or contradicted.
Do not use outside knowledge. JSON only.`;
}

export function verifierUserPrompt(
  items: { i: number; claim: string; facts: { id: string; text: string }[] }[],
): string {
  return `ITEMS: ${JSON.stringify(items)}`;
}
