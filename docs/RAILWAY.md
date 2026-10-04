# Railway deployment

Single service serves the Express API and the Vite-built client (`dist/client`).

## Service

| Item | Value |
|------|--------|
| Dockerfile | Repo root |
| Health | `GET /health` |
| Ready | `GET /health/ready` (file or Postgres store) |

## Variables (production live demo)

See `.env.example`. Typical production set:

| Variable | Purpose |
|----------|---------|
| `NODE_ENV` | `production` |
| `RENAISSANCE_MODE` | `live` |
| `SERPAPI_API_KEY` | **Required** for live SerpApi engines |
| `PUBLIC_DEMO_MODE` | `true` to require access code on search/scans |
| `ACCESS_CODE` | Secret; users enter on search page (`X-Access-Code`) |
| `OPENROUTER_API_KEY` | Optional; LLM briefs (deterministic draft if unset) |
| `OPENROUTER_MODEL` | e.g. `deepseek/deepseek-chat` |
| `RENAISSANCE_STORE` | `file` (default) or `pg` with `DATABASE_URL` |
| `RENAISSANCE_DATA_DIR` | Writable path for file store (Docker: `/app/.data`) |
| `LOG_LEVEL` | `info` |

Optional Postgres plugin: set `DATABASE_URL=${{Postgres.DATABASE_URL}}` and `RENAISSANCE_STORE=pg` for durable projects/scans.

## Docker image contents

Includes `fixtures/replay/`, `data/cities.json`, and built client (including `/demo/shepherd-pack.json` for Shepherd mode).

## Local production smoke

```bash
docker build -t renaissance .
docker run -p 3000:3000 -e RENAISSANCE_MODE=replay renaissance
```

Open http://localhost:3000

## Deploy

Link repo to Railway, set variables above, deploy from `main`. `railway.json` points health check to `/health`.
