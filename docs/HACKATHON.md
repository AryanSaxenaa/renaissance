# SerpApi India Hackathon 2026 — Renaissance submission

Renaissance is built for the **[SerpApi India Hackathon 2026](https://serpapi.github.io/serpapi-india-hackathon-2026/)** (submit by **10 October 2026, 23:59 IST**).

## Official track

**Track 05 — Knowledge & Public Interest**

Judges’ track definition: tools for education, research, jobs, news literacy, accessibility, civic information, **patents**, or other high-value public needs.

Renaissance fits this track because its core job is **patent-grounded research for engineers and small teams**: discover old grants, derive **evidence-based legal status** (not filing-date guesses), pull **Scholar** and **News** context, and publish a **cited one-page design brief** with SerpApi receipts. Shopping and Maps support **market reality** around the same mechanism but are secondary to the knowledge/public-interest story.

We are **not** submitting under AI Agents, Open-Source Integrations, Travel, Commerce-only, or Wildcard as the primary track. If your demo emphasizes shopping price tools only, reframe toward patent + research workflow.

## Meaningful SerpApi usage (judging criterion)

Search data is **required** for the product to work in live mode. Without SerpApi, users cannot discover patents, load family/legal events, or attach market/literature/news facts.

| SerpApi engine | User-facing value | Where in code |
|----------------|-------------------|---------------|
| [Google Patents](https://serpapi.com/google-patents-api) | Candidate discovery (grants, pre-screen chips) | `src/server/patents/search.ts` |
| [Google Patents Details](https://serpapi.com/google-patents-details-api) | Legal status source (family, events) | `src/server/patents/details.ts`, `status.ts` |
| [Google Shopping](https://serpapi.com/google-shopping-api) | Listings, sellers, prices (India) | `src/server/market/shopping.ts` |
| [Google Maps](https://serpapi.com/google-maps-api) | Nearby makers (city-scoped) | `src/server/market/maps.ts` |
| [Google Scholar](https://serpapi.com/google-scholar-api) | Recent literature | `src/server/literature/scholar.ts` |
| [Google News](https://serpapi.com/google-news-api) | Topic/assignee signals | `src/server/news/news.ts` |

All live calls go through **`src/server/serpapi/`** (official `serpapi` npm client, cache, credit ledger, monthly/daily caps, redaction). Each response stores **`search_metadata.id`** on facts and in the evidence bundle.

Typical live dossier: **~6 SerpApi credits** (details + shopping + maps + scholar + news; search is 1 credit). See `POST /api/v1/estimate`.

## Demo without spending credits (judges & video)

1. **Replay mode** — clone repo, `npm ci && npm run dev`, no API key. Fixtures under `fixtures/replay/`.
2. **Shepherd mode** — optional guided tour with preloaded dossier (`US4085846` replay pack at `/demo/shepherd-pack.json`). Accept on first visit or **Settings → Start Shepherd mode**. Exit tour for live app + access code.

## Public demo (live SerpApi)

Production (when deployed): see `README.md` for current URL.

Live mode needs `SERPAPI_API_KEY` and, for public demos, `ACCESS_CODE` + `PUBLIC_DEMO_MODE=true` (see `docs/RAILWAY.md`).

## Submission checklist (hackathon site)

| Requirement | Renaissance |
|-------------|-------------|
| Public GitHub repo | `https://github.com/AryanSaxenaa/renaissance` |
| Setup instructions | `README.md` |
| Demo video &lt; 3 min, local run | Owner: record search → dossier → brief → evidence receipts |
| Project description + **one track** | **Knowledge & Public Interest** (this doc) |
| SerpApi usage explanation | This doc + README “How SerpApi is used” |
| AI tools disclosure | `AI_USE.md` |
| Pre-existing work | `docs/PRE_EXISTING_WORK.md`, tag `pre-hackathon-baseline` |

Submit via the [official dashboard](https://serpapi.github.io/serpapi-india-hackathon-2026/submit.html?utm_source=india_hackathon_26) (GitHub sign-in).

## Resources

- [Hackathon rules](https://serpapi.github.io/serpapi-india-hackathon-2026/rules.html?utm_source=india_hackathon_26)
- [SerpApi integrations](https://serpapi.com/integrations?utm_source=india_hackathon_26)
- [API playground](https://serpapi.com/playground?utm_source=india_hackathon_26)
- [BuiltWithSerpApi gallery](https://serpapi.github.io/BuiltWithSerpApi/?utm_source=india_hackathon_26)

Support: hackathon `adarsh@serpapi.com`; API issues `contact@serpapi.com`.
