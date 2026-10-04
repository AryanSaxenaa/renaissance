# Renaissance

Renaissance turns old patent mechanisms into **cited, one-page design briefs** for engineers and small teams. It uses SerpApi (Google Patents, Shopping, Maps, Scholar, News) for evidence, a **deterministic legal-status engine** (not “filing + 20 years”), and a brief pipeline where **every number must appear in a cited fact**.

**Not legal advice.** Status is evidence-based and uncertain; receipts are shown where available.

## See it in under 3 minutes (no keys, no database)

```bash
git clone https://github.com/AryanSaxenaa/renaissance.git
cd renaissance
npm ci
npm run dev
```

Open [http://localhost:5173/search](http://localhost:5173/search) → sample query **centrifugal governor** → open a hit → dossier tabs (Status, Market, Literature, News, Brief, Evidence).

Replay mode is automatic when `SERPAPI_API_KEY` is unset.

### Live mode (optional; spends SerpApi credits)

Copy `.env.example` to `.env.local`, set `SERPAPI_API_KEY`, `RENAISSANCE_MODE=live`, and (for public demos) `ACCESS_CODE`. Enter the access code on the search page when prompted.

## How SerpApi is used

| Engine | Role | Typical credits |
|--------|------|-----------------|
| `google_patents` | Candidate discovery (`before=filing:…`, grants) | 1 / search |
| `google_patents_details` | Legal status source | 1 / patent |
| `google_shopping` | Market listings (India domain) | 1 |
| `google_maps` | Nearby makers | 1 |
| `google_scholar` | Recent literature | 1 |
| `google_news` | Assignee/topic signals | 1 |

All calls go through `src/server/serpapi/` (cache, ledger, budget caps, redaction). Each live call records `search_metadata.id`.

## What makes it different

1. **Evidence-based status** with confidence and a “not checked” list — never “safe to copy.”
2. **Zero uncited numbers** in brief claims (deterministic grounding + verifier).
3. **Replay mode** with fixtures for judges (`fixtures/replay/`).
4. **Re-scan** and diff for saved projects (anonymous owner cookie).

## Evaluation (small, honest)

Synthetic mini-set (`npm run eval -- --set=tests-mini`) writes `eval/report.json` and powers `/evaluation`. Expand with hand-labelled patents in `eval/labels/*.jsonl` (see `docs/EVAL.md`).

Latest mini-set metrics are in `eval/report.json` after you run eval — do not copy numbers into docs without running it.

## Deploy on Railway

Single Docker service serves API + built client. See `docs/RAILWAY.md`. Health: `GET /health`.

## Pre-existing work

See `docs/PRE_EXISTING_WORK.md`. Baseline tag: `pre-hackathon-baseline`.

## AI-use disclosure

See `AI_USE.md`.

## Tests

```bash
npm test
npm run secret-scan
npm run eval -- --set=tests-mini
npm run build
```

Record new replay fixtures (spends credits):

```bash
npm run fixtures:freeze -- "your query"
```

## Licences

See `NOTICE.md`. Third-party APIs: SerpApi, OpenRouter (optional LLM).
