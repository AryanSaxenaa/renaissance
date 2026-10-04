# Contributing to Renaissance

Renaissance is a **[SerpApi India Hackathon 2026](https://serpapi.github.io/serpapi-india-hackathon-2026/)** project (**Track: Knowledge & Public Interest**). It produces cited design briefs from **SerpApi** patent, market, scholar, and news evidence. See [docs/HACKATHON.md](docs/HACKATHON.md).

## Development

```bash
npm ci
npm run dev
```

With no `SERPAPI_API_KEY`, the server runs in **replay mode** (`fixtures/replay/`). API on port 3000; Vite on 5173 with `/api` proxied.

## Architecture

- `src/server/serpapi/` — **only** SerpApi entry point (client, cache, ledger, budget)
- `src/server/` — Express 5 REST (`/api/v1/*`), status engine, brief pipeline
- `src/client/` — React 18 + Vite + Tailwind 3 (Shepherd tour uses `/demo/shepherd-pack.json`)
- `src/shared/types.ts` — shared types
- `docs/spec/` — full build specification

## Rules

- No invented engineering numbers in briefs or fallbacks
- SerpApi only through `src/server/serpapi/`
- Use `pino` on the server (no `console.log`)
- Run `npm test` before pushing
