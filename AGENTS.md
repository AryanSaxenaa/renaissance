# Contributing to Renaissance

Renaissance is a SerpApi hackathon project: cited free-to-use design briefs from patent and market evidence.

## Development

```bash
npm ci
npm run dev
```

With no `SERPAPI_API_KEY`, the server runs in **replay mode** (fixtures under `fixtures/replay/`). API on port 3000; Vite on 5173 with `/api` proxied.

## Architecture

- `src/server/` — Express 5 REST API (`/api/v1/*`), SerpApi client, status engine, brief pipeline
- `src/client/` — React 18 + Vite + Tailwind 3
- `src/shared/types.ts` — shared types
- `docs/spec/` — full build specification

## Rules

- No invented engineering numbers in briefs or fallbacks
- SerpApi only through `src/server/serpapi/`
- Use `pino` on the server (no `console.log`)
- Run `npm test` before pushing
