# Evaluation

Status metrics support the **Knowledge & Public Interest** hackathon story: evidence-based patent status vs naive heuristics. SerpApi **Google Patents Details** feeds the engine under test; eval itself runs offline on fixtures and labelled JSON.

## Synthetic mini set (offline)

```bash
npm run eval -- --set=tests-mini
```

Writes `eval/report.json` and `src/client/public/eval/report.json` for `/evaluation`.

## Hand-labelled set (your work)

1. Add rows to `eval/labels/hand.jsonl` (one JSON object per line):

```json
{"id":"h001","patentId":"patent/US…/en","humanStatus":"expired_term","details":{…},"notes":"…","synthetic":false}
```

2. Run `npm run eval -- --set=hand`.

`humanStatus` values: `expired_term`, `lapsed_fee`, `in_force`, `related_active`, `unknown`.

Do not fabricate labels — verify against Google Patents and the office status page.

## Metrics

- **False-free rate:** engine says `LIKELY_FREE` when human says in force / related active.
- **Miss rate:** human says free, engine does not.
- **Naive disagreements:** filing+20y heuristic vs engine headline.
- **Grounding audit:** uncited numerals in verified brief claims (should be 0).

Wilson 95% intervals are included in `eval/report.json`.
