# Renaissance

SerpApi India Hackathon 2026 — **Track: Knowledge & Public Interest**. Cited design briefs from patent and market evidence via **SerpApi** (Google Patents, Patents Details, Shopping, Maps, Scholar, News). Not legal advice.

## Run locally (no API key)

```bash
npm ci
npm run dev
```

Open http://localhost:5173 — optional Shepherd tour, or search **centrifugal governor** and open a dossier. Replay fixtures load when `SERPAPI_API_KEY` is unset.

## Live SerpApi

Copy `.env.example` to `.env.local`, set `SERPAPI_API_KEY` and `RENAISSANCE_MODE=live`. Public demos: `PUBLIC_DEMO_MODE=true` and `ACCESS_CODE` (enter on search page).

## SerpApi in code

All engines go through `src/server/serpapi/`. Typical dossier ≈ 6 credits after search.

## Tests

```bash
npm test
npm run build
```

## Disclosure

Pre-hackathon baseline: git tag `pre-hackathon-baseline`. AI tools used for implementation and docs; OpenRouter optional for live brief drafts. See hackathon form for details.

## Licence

[NOTICE.md](NOTICE.md)
