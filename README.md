# Renaissance

Renaissance is a public, browser-based laboratory for finding old patents and turning promising mechanisms into modern engineering concepts.

Most expired patents are not useless. They are starting points: a pump, valve, sensor, drive train, or manufacturing idea that can be reconsidered with today’s materials, manufacturing methods, and connected controls. Renaissance makes that exploration concrete in a few minutes.

**Demo:** [watch the walkthrough](https://youtu.be/xcx4ksbn-zk) · **Live app:** [renaissance-psi.vercel.app](https://renaissance-psi.vercel.app)

## The demo path

1. Search the expired patent archive for a problem or mechanism, such as `gear assembly`, `pump`, or `flow meter`.
2. Open a result and review the patent summary, expiry information, and live market/news signals.
3. Start a remix. DeepSeek proposes three specific modernization opportunities, including materials, manufacturing methods, and expected engineering benefits.
4. Review the result in the Remix Laboratory: the modernization matrix, engineering properties, thought log, and a patent-focused blueprint visual.

The important output is not a pretty image. It is the reasoning chain from an old mechanism to a plausible modern direction.

## What Renaissance does

### Discovery

Search is powered by SerpApi’s Google Patents engine and filtered toward patents old enough to be viable remix candidates. Results retain the patent identifier, title, abstract, dates, inventors, claims, PDF link, and thumbnail when the source provides them.

### Diligence

When a patent is opened, Renaissance runs a separate research pass through Google Search and Google News. It extracts demand and competitor signals, links the underlying sources, and presents an opportunity score as research support—not as legal freedom-to-operate advice.

### Modernization

DeepSeek analyzes the patent context as a mechanical engineer and materials scientist. It returns a constrained three-row modernization matrix covering component, original approach, modern equivalent, material, and technical justification. The server validates the response and falls back to engineering heuristics when an AI provider is unavailable.

### Visual communication

The blueprint generator uses the patent context, the engineering description, and the modernization matrix to produce a dark cyanotype technical illustration. The prompt explicitly prohibits unrelated generic mechanisms and asks for a coherent, manufacturable assembly. If image generation fails, the laboratory still renders a deterministic technical SVG rather than a broken page.

## Architecture

Renaissance is a split deployment with a deliberately small public API:

```text
Vercel (React + Vite)
          │
          │  /api/query and /api/mutation
          ▼
Railway (Express + TypeScript)
     ├── SerpApi: patents, search, news
     ├── OpenRouter / DeepSeek: analysis
     └── OpenRouter image endpoint: blueprint visual
```

There is no login or account wall in the hackathon build. The Railway service stores remix projects in a local JSON store so they survive a process restart within the running instance. The filesystem is not durable across every redeploy; Supabase is the natural next step if projects need permanent multi-user storage.

## Stack

- React 18, Vite, TypeScript, Tailwind CSS
- Express API with CORS and a small query/mutation adapter
- SerpApi for Google Patents, Google Search, and Google News
- OpenRouter for model routing
- DeepSeek Flash for patent analysis by default
- Google Gemini 2.5 Flash Image through OpenRouter for blueprint visuals by default
- Railway for the API and Vercel for the frontend

## Run locally

Requirements: Node.js 20+ and API keys for the providers you want to use.

```bash
npm install
cp .env.example .env
npm run dev
```

The Vite development server runs at `http://localhost:5173`. For a production-style local run:

```bash
npm run build
npm start
```

The API listens on port `3000` unless `PORT` is set. Set `VITE_API_URL=http://localhost:3000/api` when running the frontend separately.

## Environment variables

Provider keys belong on Railway/server-side only. `VITE_API_URL` is the only provider-facing value needed by Vercel.

| Variable | Required | Purpose |
| --- | --- | --- |
| `OPENROUTER_API_KEY` | Yes for AI | Routes text and image requests through OpenRouter |
| `OPENROUTER_MODEL` | No | Analysis model; defaults to `deepseek/deepseek-v4-flash` |
| `OPENROUTER_IMAGE_MODEL` | No | Image model; defaults to `google/gemini-2.5-flash-image` |
| `DEEPSEEK_API_KEY` | Optional | Direct text-analysis fallback |
| `DEEPSEEK_MODEL` | No | Direct fallback model; defaults to `deepseek-chat` |
| `SERPAPI_API_KEY` | Yes for search | Google Patents, Search, and News access |
| `VITE_API_URL` | Vercel only | Railway API URL ending in `/api` |
| `PORT` | No | Railway/runtime port; defaults to `3000` |
| `PROJECT_STORE_PATH` | No | JSON project-store path; defaults to `.data/renaissance-projects.json` |

Start from [`.env.example`](.env.example) and never commit `.env`.

## Deploy

### Railway API

Create a Railway service from this repository, add the server-side variables above, and deploy. The repository includes `railway.json` and a production start command:

```bash
npm run build
npm start
```

Check the service at `/health`; it should return `{ "ok": true }`.

### Vercel frontend

Create a Vercel project from the same repository and set:

```text
VITE_API_URL=https://<your-railway-service>.up.railway.app/api
```

Vercel uses `npm run build:client` and publishes `dist/client`. The included `vercel.json` handles client-side routes.

## Engineering and product boundaries

Renaissance is an ideation and research tool. Its generated materials, stress values, efficiency estimates, market signals, and images are starting points for human review. They are not validated designs, patent-law opinions, safety certifications, or manufacturing-ready drawings.

The current hackathon build prioritizes a complete, explainable demo flow over persistent accounts and production-grade collaboration. The clearest production upgrade is replacing the local project store with Supabase and storing generated images in object storage instead of embedding them in project JSON.

## License

MIT
