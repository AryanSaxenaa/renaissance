# AI use disclosure

(SerpApi India Hackathon 2026 — list AI tools used in the submission form.)

## Tools

- **LLM (optional runtime):** OpenRouter (`OPENROUTER_API_KEY`) for design-brief draft JSON in live mode. Replay/Shepherd tour use fixtures or deterministic `buildReplayDraftFromFacts` when no key or on failure.
- **Development:** AI-assisted editors and agents were used to implement the spec, tests, fixtures, and documentation. All merged code was reviewed and tested (`npm test`, `npm run secret-scan`).

## Responsibility

Humans remain responsible for architecture, SerpApi integration, status rules, grounding/verifier logic, eval harness, and submission materials. SerpApi responses in replay are stored as redacted JSON under `fixtures/replay/`.

## If you used no other AI tools

State only what applies above in the hackathon form; leave other fields blank per [FAQ](https://serpapi.github.io/serpapi-india-hackathon-2026/#faq).
