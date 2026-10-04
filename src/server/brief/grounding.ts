const FACT_ID_PATTERN = /\[F\d+\]/g;
const SMALL_WORD_NUMBERS = new Set(['zero', 'one', 'two', 'three', 'four', 'five']);

export function numbersIn(text: string): string[] {
  const stripped = text.replace(FACT_ID_PATTERN, '');
  const matches = stripped.match(/\d+(?:[.,]\d+)*/g);
  if (!matches) return [];
  const out: string[] = [];
  for (const m of matches) {
    const norm = m.replace(/[,₹%$€£\s]/g, '');
    if (norm.length === 0) continue;
    out.push(norm);
  }
  const lower = stripped.toLowerCase();
  for (const w of SMALL_WORD_NUMBERS) {
    if (new RegExp(`\\b${w}\\b`).test(lower)) {
      // spelled-out small numbers ignored per spec
    }
  }
  return out;
}

export function numeralsGroundedInFacts(
  claimText: string,
  citedFacts: { text: string; value?: number | string }[],
): boolean {
  const nums = numbersIn(claimText);
  if (nums.length === 0) return true;
  const corpus = citedFacts
    .map((f) => `${f.text} ${f.value ?? ''}`)
    .join(' ');
  const corpusNums = new Set(numbersIn(corpus));
  return nums.every((n) => corpusNums.has(n));
}
