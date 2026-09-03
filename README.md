# RenaissanceAI

An industrial alchemist R&D division application for modernizing expired patents using AI.
See Demo - https://youtu.be/xcx4ksbn-zk
## Tech Stack

- **Framework**: Modelence (Full-stack TypeScript framework)
- **AI**: OpenRouter with DeepSeek (direct DeepSeek fallback)
- **Database**: MongoDB (via Modelence Cloud)
- **Frontend**: React + Vite + TailwindCSS
- **Web research**: SerpApi (Google Patents, Google Search, and Google News)

## Features

- **Patent Search**: Search expired patents using Google Patents API
- **Product Diligence**: Enrich a patent with live market and industry signals from SerpApi, linked source citations, and a transparent opportunity score
- **AI Modernization**: DeepSeek analyzes patents and suggests modern upgrades
- **Blueprint Generation**: AI-generated technical blueprint images
- **Remix Laboratory**: Interactive workspace for patent modernization projects
- **ArXiv Integration**: Automatic scanning for relevant new research papers

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and add your API keys:
   ```bash
   cp .env.example .env
   ```

   Then edit `.env`:
   ```
   OPENROUTER_API_KEY=your_openrouter_api_key
   OPENROUTER_MODEL=deepseek/deepseek-v4-flash
   OPENROUTER_IMAGE_MODEL=google/gemini-2.5-flash-image
   DEEPSEEK_API_KEY=your_deepseek_api_key
   DEEPSEEK_MODEL=deepseek-chat
   SERPAPI_API_KEY=your_serpapi_key
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open http://localhost:3000

## Deployment

### Split deployment: Vercel frontend + Railway backend

The hackathon build is public and does not require authentication. Deploy the repository to Railway as the Node API (`npm run build`, then `npm start`) and deploy the same repository to Vercel as the Vite client. Set `VITE_API_URL` in Vercel to the Railway URL ending in `/api`. Set `OPENROUTER_API_KEY`, `SERPAPI_API_KEY`, and the model variables in Railway only; never expose provider keys to Vercel.

The current Railway adapter keeps projects in memory for a simple demo. A restart clears the archive. Add Supabase persistence when durable projects are needed.

### Option 1: Railway (Recommended)

1. Push your code to GitHub
2. Go to [railway.app](https://railway.app)
3. Create new project from GitHub repo
4. Add environment variables in Railway dashboard:
   - `OPENROUTER_API_KEY` or `DEEPSEEK_API_KEY`
   - `SERPAPI_API_KEY`
   - All variables from `.env`
5. Deploy automatically

### Option 2: Render

1. Push your code to GitHub
2. Go to [render.com](https://render.com)
3. Create new Web Service from GitHub repo
4. Set build command: `npm run build`
5. Set start command: `npm run start`
6. Add environment variables
7. Deploy

### Option 3: Docker

```bash
# Build the app first
npm run build

# Build Docker image
docker build -t renaissance-ai .

# Run container
docker run -p 3000:3000 --env-file .env renaissance-ai
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `OPENROUTER_API_KEY` | OpenRouter API key for AI features |
| `OPENROUTER_MODEL` | OpenRouter analysis model, default: `deepseek/deepseek-v4-flash` |
| `OPENROUTER_IMAGE_MODEL` | OpenRouter image model, default: `google/gemini-2.5-flash-image` |
| `DEEPSEEK_API_KEY` | Optional direct DeepSeek fallback key |
| `DEEPSEEK_MODEL` | Direct DeepSeek model, default: `deepseek-chat` |
| `SERPAPI_API_KEY` | SerpApi key for Google Patents search |
| `MODELENCE_SERVICE_ENDPOINT` | Modelence Cloud endpoint |
| `MODELENCE_SERVICE_TOKEN` | Modelence Cloud authentication token |
| `MODELENCE_ENVIRONMENT_ID` | Modelence environment identifier |

## SerpApi research workflow

Patent discovery uses the `google_patents` engine. Opening a result runs an event-specific diligence workflow that queries `google` for market and competitor context and `google_news` for current industry signals. The UI links the returned sources and labels the score as research support—not legal freedom-to-operate advice.

## API Models Used

- **Text Generation**: `deepseek/deepseek-chat` through OpenRouter, or `deepseek-chat` directly
- **Blueprint visuals**: deterministic SVG fallback; no Gemini dependency

## License

MIT
