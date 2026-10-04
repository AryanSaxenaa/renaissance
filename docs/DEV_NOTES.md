# Dev notes

## Modes

- **`RENAISSANCE_MODE=replay`** — default when `SERPAPI_API_KEY` is unset; reads `fixtures/replay/`.
- **`live`** — SerpApi via `src/server/serpapi/client.ts`.
- **`record`** — live calls plus write LLM/replay artifacts (advanced).

## Store

- `RENAISSANCE_STORE=file` → `.data/` (or `RENAISSANCE_DATA_DIR`).
- `RENAISSANCE_STORE=pg` + `DATABASE_URL` → Postgres (`src/server/store/pgStore.ts`).

## SerpApi / fixtures

- Scholar replay uses a stable `as_ylo` in fixtures so hashes do not drift every year.
- Patent search replay uses dynamic `before=filing:{year-20}0101`; see duplicate fixtures in `fixtures/replay/` if hashes change.
- Freeze live responses: `npm run fixtures:freeze -- "query"`.
- Shepherd tour JSON: `npm run shepherd:export` → `src/client/public/demo/shepherd-pack.json`.

## Client

- Shepherd decision: `localStorage` key `renaissance:shepherd:decision` (`unset` | `accepted` | `declined`).
- Demo dossier route: `/dossier/shepherd-demo` (static pack, no API credits).

## Hackathon

Track and SerpApi engine mapping: [HACKATHON.md](./HACKATHON.md).
