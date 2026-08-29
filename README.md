# RenaissanceAI

An industrial alchemist R&D division application for modernizing expired patents using AI.
See Demo - https://youtu.be/xcx4ksbn-zk
## Tech Stack

- **Framework**: Modelence (Full-stack TypeScript framework)
- **AI**: Google Gemini 2.0 Flash (Text & Image Generation)
- **Database**: MongoDB (via Modelence Cloud)
- **Frontend**: React + Vite + TailwindCSS
- **Patents API**: Google Patents via SerpApi

## Features

- **Patent Search**: Search expired patents using Google Patents API
- **AI Modernization**: Gemini AI analyzes patents and suggests modern upgrades
- **Blueprint Generation**: AI-generated technical blueprint images
- **Remix Laboratory**: Interactive workspace for patent modernization projects
- **ArXiv Integration**: Automatic scanning for relevant new research papers

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.modelence.env` with your API keys:
   ```
   GEMINI_API_KEY=your_gemini_api_key
   SERPAPI_API_KEY=your_serpapi_key
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open http://localhost:3000

## Deployment

### Option 1: Railway (Recommended)

1. Push your code to GitHub
2. Go to [railway.app](https://railway.app)
3. Create new project from GitHub repo
4. Add environment variables in Railway dashboard:
   - `GEMINI_API_KEY`
   - `SERPAPI_API_KEY`
   - All variables from `.modelence.env`
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
docker run -p 3000:3000 --env-file .modelence.env renaissance-ai
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | Google Gemini API key for AI features |
| `SERPAPI_API_KEY` | SerpApi key for Google Patents search |
| `MODELENCE_SERVICE_ENDPOINT` | Modelence Cloud endpoint |
| `MODELENCE_SERVICE_TOKEN` | Modelence Cloud authentication token |
| `MODELENCE_ENVIRONMENT_ID` | Modelence environment identifier |

## API Models Used

- **Text Generation**: `gemini-2.0-flash`
- **Image Generation**: `gemini-2.0-flash-exp-image-generation`

## License

MIT
