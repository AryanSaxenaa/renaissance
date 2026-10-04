# Final gate checklist

## Product & SerpApi

- [x] Live mode uses six SerpApi engines (patents, details, shopping, maps, scholar, news)
- [x] All SerpApi traffic via `src/server/serpapi/`
- [x] Facts and bundles store `search_metadata.id` where present
- [x] Replay mode works without keys (`npm run dev`)
- [x] Shepherd mode (opt-in tour with preloaded dossier)
- [x] API smoke script (`scripts/api-smoke.ts`)

## Quality

- [x] Status engine unit tests (26+ cases)
- [x] SerpApi client tests (mock transport)
- [x] Guards tests (access code live-only)
- [x] Eval mini harness (`npm run eval -- --set=tests-mini`)
- [x] Secret scan (`npm run secret-scan`)
- [x] Legacy invented-number fallbacks removed

## Deploy

- [x] Single-service Docker + Railway health `/health`
- [x] `data/cities.json` shipped in image (maps city validation)

## Hackathon submission (owner)

- [ ] **Track selected:** Knowledge & Public Interest — see [HACKATHON.md](./HACKATHON.md)
- [ ] Demo video &lt; 3 min (local run: replay or live + SerpApi receipts on Evidence tab)
- [ ] Submit on [official site](https://serpapi.github.io/serpapi-india-hackathon-2026/submit.html?utm_source=india_hackathon_26) by **10 Oct 2026, 23:59 IST**
- [ ] Description explains **meaningful SerpApi usage** (not optional garnish)
- [ ] [AI_USE.md](../AI_USE.md) complete
- [ ] Hand-labelled eval set (`eval/labels/hand.jsonl`) — stretch goal
- [ ] Rotate any API key ever pasted in chat or logs
