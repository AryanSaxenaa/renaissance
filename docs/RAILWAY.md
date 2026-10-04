# Railway deployment

## Services

| Service | Notes |
|---------|--------|
| `renaissance` | Dockerfile at repo root; serves API + `dist/client` |
| Postgres (plugin) | `DATABASE_URL=${{Postgres.DATABASE_URL}}`, set `RENAISSANCE_STORE=postgres` |

## Variables (production)

See `.env.example`. Required for public live demo:

- `PUBLIC_DEMO_MODE=true`
- `ACCESS_CODE` (secret)
- `SERPAPI_API_KEY`
- `OPENROUTER_API_KEY` (optional; replay draft works without LLM)

## Health

- `GET /health` — liveness
- `GET /health/ready` — store readiness

## Local production smoke test

```bash
docker build -t renaissance .
docker run -p 3000:3000 -e RENAISSANCE_MODE=replay renaissance
```

Open http://localhost:3000
