# Renaissance

**SerpApi India Hackathon 2026** · Track **Knowledge & Public Interest** · Submit by **10 Oct 2026, 23:59 IST**

Renaissance turns old patent mechanisms into **cited, one-page design briefs** for engineers and small teams. **SerpApi is the evidence layer**: Google Patents (search + details), Shopping, Maps, Scholar, and News feed a deterministic legal-status engine and a brief pipeline where **every number must appear in a cited fact**.

**Not legal advice.** Status is evidence-based; receipts (`search_metadata.id`) are shown where available.

Full hackathon framing, track rationale, and submission checklist: **[docs/HACKATHON.md](docs/HACKATHON.md)**.

## See it in under 3 minutes (no SerpApi key)

```bash
git clone https://github.com/AryanSaxenaa/renaissance.git
cd renaissance
npm ci
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) → optional **Shepherd mode** tour (preloaded replay dossier) or **Skip** → [Search](http://localhost:5173/search) → sample **centrifugal governor** → open a hit → dossier tabs (Status, Market, Literature, News, Brief, Evidence).

Replay mode is automatic when `SERPAPI_API_KEY` is unset (`fixtures/replay/`).

## Live SerpApi mode (optional; spends credits)

1. Copy `.env.example` → `.env.local`
2. Set `SERPAPI_API_KEY` ([free tier](https://serpapi.com/users/sign_up?plan=free&utm_source=india_hackathon_26) includes monthly credits)
3. Set `RENAISSANCE_MODE=live`
4. For a public demo: `PUBLIC_DEMO_MODE=true` and a strong `ACCESS_CODE` — enter the code on the search page when prompted
5. Optional LLM briefs: `OPENROUTER_API_KEY` (falls back to deterministic draft if unset)

Record replay fixtures after a live run (uses credits):

```bash
npm run fixtures:freeze -- "centrifugal governor"
npm run fixtures:freeze -- "centrifugal governor" --minimal   # ~2 credits
```

Regenerate the Shepherd tour pack from curated replay fixtures:

```bash
npm run shepherd:export
```

## How SerpApi powers the product

| Engine | Role | Typical credits |
|--------|------|-----------------|
| `google_patents` | Candidate discovery (`before=filing:…`, grants) | 1 / search |
| `google_patents_details` | Family members, legal events → status rules R1–R8 | 1 / patent |
| `google_shopping` | Market listings (India: `google.co.in`, `gl=in`) | 1 |
| `google_maps` | Nearby makers (city from `data/cities.json`) | 1 |
| `google_scholar` | Recent literature (`as_ylo` from filing window) | 1 |
| `google_news` | Topic / assignee signals | 1 |

Implementation: **`src/server/serpapi/`** only (cache, ledger, budget caps, redaction). REST API: `/api/v1/search`, `/api/v1/scans`, evidence bundle. No SerpApi calls from the client.

## What makes it different

1. **Evidence-based patent status** with confidence and a “not checked” list — never “safe to copy.”
2. **Zero uncited numbers** in brief claims (grounding + verifier).
3. **Replay mode + Shepherd tour** so judges can try it without keys.
4. **Re-scan** and diff for saved projects (anonymous owner cookie).

## Architecture

| Layer | Stack |
|-------|--------|
| API | Express 5, `/api/v1/*`, `src/server/` |
| Client | React 18, Vite, Tailwind 3, `src/client/` |
| Shared types | `src/shared/types.ts` |
| Spec | `docs/spec/RENAISSANCE-FULL-SPEC.md` |

## Evaluation

```bash
npm run eval -- --set=tests-mini
```

Writes `eval/report.json` and powers `/evaluation`. Hand-labelled patents: `eval/labels/hand.jsonl` — see [docs/EVAL.md](docs/EVAL.md). **Do not copy metric numbers into docs without running eval.**

## Deploy

Single Docker image (API + static client). [docs/RAILWAY.md](docs/RAILWAY.md) · Health: `GET /health` · Ready: `GET /health/ready`

## Tests & hygiene

```bash
npm test                 # 45 unit/integration tests
npm run secret-scan
npm run build
npx tsx scripts/api-smoke.ts   # optional; set BASE_URL + ACCESS_CODE for live smoke
```

## Other docs

| Doc | Purpose |
|-----|---------|
| [docs/HACKATHON.md](docs/HACKATHON.md) | Track, SerpApi mapping, submission checklist |
| [docs/RAILWAY.md](docs/RAILWAY.md) | Production env vars |
| [docs/EVAL.md](docs/EVAL.md) | Status metrics |
| [docs/FINAL_CHECK.md](docs/FINAL_CHECK.md) | Pre-submit gate |
| [docs/PRE_EXISTING_WORK.md](docs/PRE_EXISTING_WORK.md) | Baseline tag `pre-hackathon-baseline` |
| [AI_USE.md](AI_USE.md) | AI disclosure |
| [NOTICE.md](NOTICE.md) | Licences |

## Licences

See [NOTICE.md](NOTICE.md). Third-party APIs: **SerpApi** (required for live data), OpenRouter (optional LLM).
