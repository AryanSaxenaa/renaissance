# Renaissance × SerpApi — FULL SPEC PACK

One file for the Cursor agent. Sections are the seven pack files, concatenated unchanged.

**Submission (2026):** Official track **Knowledge & Public Interest** · SerpApi engines & checklist → [../HACKATHON.md](../HACKATHON.md) · User-facing [../../README.md](../../README.md).

## Table of contents

1. `00-README-for-agent.md` — 00 — READ ME FIRST (Cursor agent): **Renaissance × SerpApi**
2. `01-product-spec.md` — 01 — Product Spec: **Renaissance** (existing) → **Renaissance: cited free-to-use design briefs**
3. `02-serpapi-usage.md` — 02 — SerpApi Usage (Renaissance): engines, parameters, credits, caching, fixtures
4. `03-architecture-and-changes.md` — 03 — Architecture, Data & Change List (Renaissance)
5. `04-ui-design-spec.md` — 04 — UI & Design Spec: Renaissance "Specification Sheet on the Drafting Table"
6. `05-readme-and-submission-checklist.md` — 05 — README Skeleton & Submission Checklist (Renaissance)
7. `06-cursor-agent-prompts.md` — 06 — Cursor Agent Prompts (Renaissance) — copy-paste, in order


---

<!-- ===== 00-README-for-agent.md ===== -->

# 00 — READ ME FIRST (Cursor agent): **Renaissance × SerpApi**

You are modifying an **existing** repository (`AryanSaxenaa/renaissance`, currently **private**) so it can be made public and submitted to the SerpApi India Hackathon. This pack says what the repo is today (read from the real code), what to change, in what order, and what you must never do. Anything not read is marked **VERIFY**.

> Renaissance is **not** new work. It was started for a different event, built on the Modelence framework, and later adapted; its SerpApi workflow was added in a later commit. Honest disclosure is a hard requirement (§3).

---

## 1. One-paragraph product (target)

**Renaissance** turns expired or lapsed patents into **cited, one-page "free-to-use design briefs."** For a mechanism (e.g. "centrifugal governor"), it finds candidate old patents, **verifies their legal status from evidence** (Google Patents details: per-family-member legal status, legal events, continuations, citations — *not* a "filing date + 20 years" guess), shows **who still sells products using that mechanism** (Google Shopping) and **who makes it near you in India** (Google Maps), pulls **recent papers** (Google Scholar) and **assignee news** (Google News), and ends with a brief where **every claim is tied to a source fact id** and **no number appears unless a source contains it**. Status is always labelled with its uncertainty ("likely free, not legal advice"). A "re-scan" shows what changed. An evidence bundle holds every `search_metadata.id`. A replay mode runs the full product with no keys.

## 2. Pack contents (read in order)

| File | What it gives you |
|---|---|
| `00-README-for-agent.md` | Rules, build phases, VERIFY register |
| `01-product-spec.md` | Today vs target, MVP/stretch, judging mapping, track |
| `02-serpapi-usage.md` | Engines, params, fields, credits, budget, caching, fixtures |
| `03-architecture-and-changes.md` | Current/target architecture, file-level changes, data model, pipeline, prompts & schemas, tests, eval, Railway spec |
| `04-ui-design-spec.md` | UI refresh on the existing React 18 + Tailwind 3 stack |
| `05-readme-and-submission-checklist.md` | README skeleton, disclosures, form answers, judge checklist |
| `06-cursor-agent-prompts.md` | 11 copy-paste prompts with acceptance criteria |
| `RENAISSANCE-FULL-SPEC.md` | Everything in one file |

## 3. Non-negotiable rules

1. **Honest history.** Judges may read history.
   - Do **not** rewrite, squash, rebase or force-push; **no backdating**.
   - Tag the current head **`pre-hackathon-baseline`** before changing anything (head when this pack was written: `0db0d36`, 29 commits — VERIFY). Landmarks to cite: first commit `53bba0d` ("First commit: Renaissance AI patent modernization tool"); deployment-config commit `8a50863` ("Add Railway, Render, and Docker deployment configurations"); SerpApi workflow `48f4559` ("Add SerpApi product diligence workflow"); OpenRouter/DeepSeek `1ed2046`; Vercel/Railway split `2e6029c`.
   - Early history mentions **Modelence** and Vercel config — it was built first for another event (VERIFY the event name with the owner and state it). Do not hide or "clean" this.
   - New commits: conventional prefixes `feat(patents): …`, `feat(serpapi): …`, `fix(security): …`, `chore(railway): …`, `docs: …`.
   - Commit this pack under `docs/spec/` as `docs: add build specification (AI-assisted)`.
2. **Disclose** pre-existing work and AI use in README, `docs/PRE_EXISTING_WORK.md`, `AI_USE.md`, and the form (texts in `05`). Form answer to "existed before": **Yes**.
3. **Before making the repo public:** run the secret scan (Prompt 1) across **full history** (e.g. `git log -p` grep patterns; consider `gitleaks` locally). The repo currently has `.env*` ignored, but `.cursor/mcp.json` is committed (it contains only a docs URL — VERIFY); old commits may contain keys — if any key ever appeared, **rotate it**; rewriting history is *not* an allowed fix, rotation is. Remove `console.log` of key presence/length (see `03`).
4. **No invented facts.** The product must not print numbers (torque, stress, % improvement, savings) that are not present in a cited source fact. The old hard-coded fallback tables (e.g. `442.8 Nm`, `18.2 MPa`, "40% weight reduction") must be deleted. Synthetic test data lives in `tests/fixtures/synthetic/` with `"synthetic": true`.
5. **No legal advice, no overclaiming.** Status is *evidence-based and uncertain*. Never say "safe to copy." Say "no active family member found in the records retrieved." Always show the disclaimer and the list of what was not checked (jurisdictions, design patents, trademarks, unpaid-fee reinstatements, term adjustments you could not see).
6. **SerpApi budget discipline.** 250 searches/month, 50/hour. One module (`src/server/serpapi/`) enforces cap, bucket, cache, ledger, redaction. Tests never touch the network. No auto-run LLM/SerpApi calls on page load or per-result loops (the current client auto-analyses every search result — remove).
7. **Everything demoable offline** with fixtures: `RENAISSANCE_MODE=replay` needs no keys, no Postgres.
8. **Fix the public-endpoint risk**: currently every endpoint is unauthenticated and CORS is open; a public deploy could drain credits. Implement the guards in `03` §11.
9. **No dates/timelines in anything you write.**

## 4. Build order (phases)

| Phase | Name | Outcome |
|---|---|---|
| 1 | Baseline, hygiene, secrets | Tag; disclosure stubs; secret scan incl. history; remove debug logs; delete stale Modelence/AGENTS text; fix healthcheck |
| 2 | Server restructure + SerpApi core | Split `railway.ts`; `serpapi/` client (cache, ledger, budget, bucket, redaction, transport) |
| 3 | Real legal status | `google_patents` search with proper params; `google_patents_details`; deterministic status engine with confidence + uncertainty list |
| 4 | Market & literature evidence | `google_shopping`, `google_maps`, `google_scholar`, `google_news` facts |
| 5 | Facts table + cited brief | Fact ids; generator + verifier prompts; numeric-grounding check; brief JSON + markdown |
| 6 | Persistence, scans, change tracking | Postgres (or file) store; scans; re-scan diff; owner token scoping |
| 7 | Evidence bundle + replay | `renaissance.evidence/1`; fixtures; replay mode; verifier script |
| 8 | Eval | Labelled status set; naive-rule vs evidence-based comparison; grounding audit |
| 9 | UI refresh | "Specification sheet" UI per `04`; remove fake landing content |
| 10 | Railway | Single-service image serving API+client; Postgres; health; guards |
| 11 | Docs & submission | README, disclosure, form, final gate |

Stretch (only after 11 is green): AI illustration clearly labelled "illustrative", design-around finder, EP/IN coverage notes, MCP/`serpapi-search-tools` adapter. See `01` §4.2.

## 5. Repository facts (read from the repo at `0db0d36`)

- **Client:** React 18, Vite 6 (`root: src/client`, output `dist/client`, alias `@`→`src`), Tailwind 3.4, react-router-dom 6, TanStack Query 5, lucide-react, react-hot-toast, clsx, tailwind-merge, zod 4 (declared; use unclear). Pages: Landing, PatentSearch, Laboratory, Archive, Settings, NotFound. Components: AppLayout, PatentCard, PatentDetailModal, BlueprintCanvas, ThoughtTerminal, UI primitives. `lib/api.ts` wraps POST to `/api/query|mutation/renaissance/:method`.
- **Server:** Express 5, **one file** `src/server/railway.ts` (tsup → `dist/server/railway.js`); logic in `src/server/…/patents.ts` (SerpApi) and `…/gemini.ts` (misnamed; OpenRouter/DeepSeek). `package.json` name is `sandbox`; `npm test` is a stub (no tests).
- **Storage:** projects in a Map persisted to `.data/renaissance-projects.json` (not durable on Railway redeploys; blueprint PNGs embedded as base64); search history in memory only.
- **SerpApi today:** `google_patents` search (query text gets `before:<hard-coded year>` appended — not the `before` parameter), "expired" = filing + 20 years, claims never fetched, `getPatentById` uses a search instead of `google_patents_details`; per detail-open: `engine=google` + `engine=google_news` (2 credits, uncached, no `search_metadata.id` kept); opportunity score = result-count arithmetic.
- **LLM today:** one prompt (temperature 0.7) asks for 3 modernizations + invented property values; regex JSON extraction; hard-coded per-division fallback tables with invented numbers; scripted "thought log"; image endpoint for cyanotype blueprint PNG.
- **Deploy today:** Vercel client (`renaissance-psi.vercel.app`) + Railway API. `Dockerfile` (node:20-alpine, port 3000), `railway.json` (NIXPACKS, start `npm run start`, **`healthcheckPath: "/"`** while Express serves only `/health` → VERIFY how it currently deploys), `vercel.json`, `render.yaml` (Vercel-style JSON, references `MODELENCE_*` — stale).
- **Stale artefacts:** `AGENTS.md` (Modelence scaffold text), `.cursor/mcp.json` (docs.modelence.com), `tsconfig` mentions `.modelence/` and a `next` plugin.
- **Client behaviours to fix:** auto-runs `analyzePatentPreview` (LLM) per search result with 2 s spacing; hard-coded `user = {handle:'PUBLIC OPERATOR'}` in layout/pages and navigation to a non-existent `/login`; landing has dead `#pricing` link, no-op newsletter form, fixed footer text with a historic copyright range and an entry-date string, static "STATUS: VERIFIED/DEPLOYED" badges, claims like "Deep-learning mining" and "Instant CAD generation compatible with multi-axis CNC"; "ARXIV MATERIAL UPDATES" panel is always empty (`getArxivPapers` returns `[]`).
- **Unread files (VERIFY):** `ArchivePage`, `SettingsPage`, `BlueprintCanvas`, `ThoughtTerminal` internals.

## 6. VERIFY register

| # | Item | Resolve by |
|---|---|---|
| V1 | Head still `0db0d36`? | `git log -1` before tagging |
| V2 | Which earlier event/framework origin (Modelence) and exact name for disclosure | Ask owner; write in `PRE_EXISTING_WORK.md` |
| V3 | Any secrets in history (`git log -p`) | gitleaks/regex; rotate if found |
| V4 | Licence of repo and of any Modelence-derived scaffold files | Inspect; add `NOTICE.md`; confirm owner's right to publish |
| V5 | Does `before:<hard-coded year>` inside `q` filter, or is it ignored? Which `before`/`after` param format works (`filing:YYYYMMDD` per docs) | First real call; save as fixture |
| V6 | Allowed values of `legal_status_cat` / `legal_status` beyond `active`/`Active` seen in docs sample (e.g. expired, lapsed, pending, ceased) | Collect from ≥ 30 real details responses; build the vocabulary table in `docs/STATUS_VOCAB.md` |
| V7 | `legal_events[].code` meaning for maintenance/expiry (e.g. FEPP seen in docs sample; expiry/lapse codes by office) | Gather from fixtures; map only codes actually observed; unknown code → "unrecognised event" |
| V8 | `country_status` values and keys in search results (docs show `ACTIVE`/`NOT_ACTIVE` per country) | Fixture |
| V9 | `google_patents_details` field `claims[]` shape (strings vs objects) | Fixture |
| V10 | `google_maps` `local_results[].website` presence | Fixture; fallback to `place_id` link |
| V11 | `google_news` `news_results[].source` is an **object** in docs (`{name, authors}`) with `iso_date`; existing code may assume a string/other shape | Fix adapter; fixture |
| V12 | How Railway currently passes the `/` healthcheck | Check Railway dashboard logs; replace with `/health` |
| V13 | `ArchivePage`/`SettingsPage`/`BlueprintCanvas` behaviours | Read before refactor |
| V14 | Whether `zod`, `lucide`, `react-hot-toast` are used everywhere | `rg` |
| V15 | Hackathon form wording for "existed before"/AI fields; repo must be public | Open dashboard |
| V16 | Whether SerpApi offers extra development credits | Draft in `05` §8 (parent routes it) |
| V17 | Railway Postgres plugin variable names and Hobby limits | Railway dashboard / docs at deploy time |
| V18 | Patent-term rules per jurisdiction presented in UI (20 years from filing in many offices; adjustments/extensions exist) | Keep wording generic; cite Google/Office source; never legal advice |

## 7. Definition of done

- `npm i && npm run dev` works with no keys in replay mode; a judge sees a complete brief for 3 recorded patents in under 3 minutes with receipts visible.
- Live mode with a key respects caps; status results come from `google_patents_details`; the brief has zero uncited numbers (automated check).
- Railway deployment passes the healthcheck, uses Postgres, and live endpoints are guarded.
- README, disclosures, secret scan, history story are all in order; repo is public-ready.


---

<!-- ===== 01-product-spec.md ===== -->

# 01 — Product Spec: **Renaissance** (existing) → **Renaissance: cited free-to-use design briefs**

## 1. Problem

Small manufacturers, student teams and independent engineers could build on decades-old mechanisms — but nobody can tell, quickly and credibly, (a) whether the underlying patents are *really* free to use, (b) whether the mechanism is still a living market or a dead end, and (c) what a modern redesign could improve. Patent search tools list documents; they do not produce an actionable, *auditable* starting brief. Naive tools guess "expired" from a date, and generative tools invent plausible-sounding engineering numbers.

## 2. What Renaissance is today (from the repo)

| Aspect | Today (baseline) |
|---|---|
| Flow | Landing → search old patents → open one for a "diligence brief" → "remix" in a lab → modernization matrix, thought log, blueprint image → archive |
| SerpApi | `google_patents` search; per opened patent: `google` + `google_news` (2 credits, no caching, no ids kept) |
| "Expired" | filing date + 20 years < today (fallbacks: publication − 1 year, else a hard-coded early default) |
| Claims | never fetched (placeholder string) |
| Score | `opportunityScore` = 35 + min(30, 6×market results) + min(25, 5×news results) + 10 if ≥ 5 sources → label HIGH/MEDIUM/LOW |
| LLM | one prompt to DeepSeek via OpenRouter, temp 0.7, asks for specifics; fallback tables with invented values (`442.8 Nm`, `18.2 MPa`, "40% weight reduction") |
| Storage | in-memory Map → local JSON file; not durable on redeploy |
| Auth/limits | none; CORS open; public endpoints spend credits |
| Deploy | Vercel client + Railway API (`railway.json` NIXPACKS; healthcheck path `/`) |
| UI | cyanotype/blueprint theme; some placeholder/overclaiming landing copy; scripted thought terminal |

## 3. Target product

> **Renaissance finds old mechanisms that appear free to use, proves it with sources, shows who still builds them, and ends with a one-page brief where every claim has a receipt.**

### Principles
1. **Evidence over inference.** Status comes from retrieved legal data; the 20-year date is only a *consistency check*, never the verdict.
2. **Uncertainty is a feature.** Every verdict has a confidence class, the evidence list, and a "not checked" list.
3. **No uncited numbers.** The brief generator can only cite fact ids; a deterministic verifier rejects any claim containing a number not found in the cited facts.
4. **Real market signal.** Sellers (Shopping) and nearby makers (Maps) — counts and ranges *as retrieved*, with receipts — not a made-up opportunity score.
5. **Re-scan, don't trust old answers.** Show what changed since the last scan.
6. **Every SerpApi call leaves a receipt** (`search_metadata.id`, engine, redacted params, credits) and ships in an evidence bundle.
7. **Honest by default:** not legal advice; replay mode labelled; sample data labelled.

## 4. Features

### 4.1 MVP

| ID | Feature | P | Notes |
|---|---|---|---|
| F1 | **Candidate discovery** (`google_patents`) with correct params (`before=filing:<cutoff>`, `status=GRANT`, `type=PATENT`, `num`, `dups`, optional `country`/`assignee`) and `country_status` chips from search results | P0 | cutoff computed at runtime = today − 20 years (no hard-coded date) |
| F2 | **Legal status engine** (`google_patents_details`): per-family-member `legal_status_cat`, `legal_events`, continuations, citation recency → verdict class with confidence + uncertainty list | P0 | Replaces filing+20y guess; pure deterministic function, fully unit-tested |
| F3 | **Who still sells it** (`google_shopping`) | P0 | seller count, price range (`extracted_price`), top sources, product titles; `gl=in`, `google_domain=google.co.in` |
| F4 | **Who makes it near you** (`google_maps`) | P0 | local makers list with rating/reviews/type/address from `local_results` |
| F5 | **Modern literature** (`google_scholar`) | P0 | recent papers on the mechanism (`as_ylo` computed), cited-by counts |
| F6 | **Assignee / topic news** (`google_news`) | P1 | recent coverage; shown as signals, not verdicts |
| F7 | **Facts table → cited design brief** | P0 | generator + verifier prompts (03 §7); output JSON + markdown + printable one-pager |
| F8 | **Re-scan & change tracking** | P0 | `no_cache` re-fetch of status/market facts; diff panel |
| F9 | **Evidence bundle** `renaissance.evidence/1` + offline verifier | P0 | deterministic status can be re-derived from raw excerpts |
| F10 | **Credit governor + access guard** | P0 | caps, bucket, ledger, access code for live; per-owner scoping of saved briefs |
| F11 | **Replay mode** with recorded fixtures | P0 | no keys/DB needed; banner |
| F12 | **UI refresh: specification sheet** | P0 | See `04` |
| F13 | **Railway deployment** | P0 | single service (API + client) + Postgres |
| F14 | **Eval**: naive 20-year rule vs evidence-based status; grounding audit | P0 | numbers in README only from the run |
| F15 | **Cleanup**: delete invented-number fallbacks, scripted thoughts, debug logs, fake landing claims, stale Modelence files | P0 | labelled commits |

### 4.2 Stretch (strict order)

| ID | Feature | Notes |
|---|---|---|
| S1 | Real patent figures as the "blueprint" (search `figures`/details images) instead of AI imagery; AI image only as "illustrative" | |
| S2 | Design-around finder: CPC neighbours via details `classifications` + `similar_documents` | |
| S3 | `serpapi-search-tools` / MCP adapter exposing `check_free_to_use` | Open-source integration angle |
| S4 | Watchlist with scheduled re-scans via Railway cron service | |
| S5 | EP/IN coverage notes (what Google data shows per office) | |

## 5. User flows

1. **Judge (replay)** — open → pick a recorded mechanism → candidate list with status chips → open dossier → **Status** tab (verdict, evidence, uncertainty, receipts) → **Market** (sellers, makers) → **Literature** → **Brief** (one page, citations `[F7]`) → export bundle.
2. **Maker (live)** — search "centrifugal governor", cost preview → results → dossier → "Generate brief" → print.
3. **Returning user** — open saved brief → **Re-scan** → see "Price range moved; one new news item; status unchanged".

## 6. Metrics (reported only from runs)

| Metric | Definition |
|---|---|
| Naive-vs-evidence disagreement | % of labelled patents where the 20-year rule says "free" but the evidence engine says "not free"/"uncertain" (and the reverse) |
| False-free rate | labelled "not free" (hand-verified) that engine called `LIKELY_FREE` — target 0, report CI |
| Brief grounding | % of brief claims with ≥ 1 valid fact id; count of uncited numbers (must be 0) |
| Verifier rejections | % of generated claims dropped by verifier |
| Credits per brief | mean/max, breakdown per engine |
| Replay duration | wall-clock of recorded demo |

## 7. Non-goals
Legal opinions; freedom-to-operate certification; design/trade-dress/trademark checks; CAD generation; materials-property prediction; claims about performance improvements.

## 8. Originality (be honest)
Patent landscaping tools exist. Distinctive here: **(1)** evidence-derived "free-to-use" status with a visible uncertainty model (vs date arithmetic); **(2)** fusion of patents + shopping + maps + scholar + news into a *market-reality* check for dead mechanisms ("is anyone still selling this?"; India-local makers); **(3)** a **zero-uncited-numbers** brief enforced by a deterministic verifier; **(4)** re-scan diffing; **(5)** receipts + offline-verifiable bundles.

## 9. Safety, ethics, legal
- Banner on every status and brief: "Informational only — not legal advice. Status data may be incomplete or out of date. Consult a patent attorney before relying on this."
- Words: "appears free to use," "no active family member found," never "safe," "legal to copy," "guaranteed."
- Do not present patent holders negatively; news is signal, not accusation.
- Privacy: queries and saved briefs are scoped to an anonymous owner token; no accounts; retention window; delete button.
- Third-party content: store only metadata/short snippets in fixtures; no images/thumbnails in fixtures.

## 10. Judging-criteria mapping
| Criterion | How Renaissance answers |
|---|---|
| Idea strength | "Free-to-use" is only valuable if provable; make the proof the product |
| Originality | Evidence-based status + market reality + zero-uncited-numbers brief + re-scan |
| Technical complexity | Deterministic status engine over family/legal-event data; multi-engine fact fusion; generator+verifier LLM; budget governor; transport/replay; Postgres store; evidence bundle |
| Usefulness | Output a small manufacturer/student can act on; India-local makers; honest limits |
| Meaningful SerpApi usage | Six engines (`google_patents`, `google_patents_details`, `google_shopping`, `google_maps`, `google_scholar`, `google_news`) each feeding *facts that change the verdict or the brief*; ablation vs naive baseline |

## 11. Track recommendation
**Primary: Commerce & Market Intel** (market-reality and sourcing angle). **Alternative: Knowledge & Public Interest** (open knowledge reuse of expired IP). Open Innovation is the safe fallback. Not a fit: Travel & Local.

## 12. Product acceptance checklist
- [ ] No invented numbers anywhere in UI/LLM/fallbacks (automated grep + brief verifier test).
- [ ] Status never derived solely from the 20-year date.
- [ ] Each SerpApi-derived fact shows a receipt; bundle verifies offline.
- [ ] Live endpoints guarded; replay open; credit cap enforced.
- [ ] Landing contains no dead links, fake badges, or overclaims.
- [ ] README discloses pre-existing work, Modelence origin, AI use, tag → HEAD diff.


---

<!-- ===== 02-serpapi-usage.md ===== -->

# 02 — SerpApi Usage (Renaissance): engines, parameters, credits, caching, fixtures

Facts below come from SerpApi's public docs read while writing this pack (and the Mirror pack's verified mechanics). Anything not shown on a doc page is **VERIFY** — confirm on the first real call and save the response as a fixture.

## 1. Platform mechanics (apply to every call)

| Topic | Fact |
|---|---|
| Endpoint | `GET https://serpapi.com/search(.json)` with `engine` + params + `api_key` |
| Client | Node: npm `serpapi` (official; current major 2.x — VERIFY exact version at install). Wrap behind `Transport` (record/replay). Agent-friendly helpers: `serpapi-search-tools` (Python) / SerpApi MCP — only for stretch S3 |
| Credits | Only successful, **non-cached** searches count; errors and cache hits are free; **empty-result searches still count as 1**; result count doesn't change cost. SerpApi's own cache lasts **1 hour**; `no_cache=true` forces live; `async` must not be combined with `no_cache` |
| Free plan | **250 searches/month; 50/hour** |
| Account API | `GET /account?api_key=…` — free; fields include `total_searches_left`, `this_month_usage`, `this_hour_searches`, `account_rate_limit_per_hour` |
| `search_metadata` | `id`, `status`, `json_endpoint`, `created_at`, `processed_at`, `raw_html_file`, `total_time_taken` — **store `id` + `json_endpoint` for every call** (the baseline stores none) |
| Archive API | `GET /searches/{id}.json?api_key=…`; retained **31 days**; expired → 410 |
| `json_restrictor` | trims fields; syntax `foo.bar`, `foo[]`, `foo.{a,b[].c}` — use for `google_patents_details` (large) after fixtures prove field names (VERIFY) |
| Errors | 401 invalid key; 429 hourly throughput **or** out of searches (distinguish via Account API); 5xx → one backoff retry; other 4xx → no retry |
| Hackathon | 1,000 credits per valid submission, awarded after judging. Questions: adarsh@serpapi.com; API issues: contact@serpapi.com |

## 2. Engines used

### 2.1 `google_patents` — discovery + cheap pre-screen (F1)

| Param | Use |
|---|---|
| `q` | mechanism terms; semicolon-separated terms follow Google Patents advanced syntax. **Do not append `before:` to text** (current code does; VERIFY V5) |
| `before` | `filing:YYYYMMDD` where the date is **computed at runtime** = today − 20 years (type prefix may be `priority`, `filing` or `publication`). Gives candidates whose filing is ≥ 20 years old |
| `after` | optional lower bound `filing:YYYYMMDD` (config `SEARCH_EARLIEST_FILING_YEAR`, no hard-coded date in docs) |
| `status` | `GRANT` (default) |
| `type` | `PATENT` (exclude designs in MVP) |
| `country` | optional; default none (US-heavy results are fine; show per-country status chips) |
| `num` | 10–100; default 10 (cost is per call, not per result — use 20 to widen candidates) |
| `sort` | `old`/`new`; default relevance |
| `dups`, `patents`, `scholar`, `language`, `inventor`, `assignee`, `litigation` | optional filters (`litigation=YES` is a risk signal filter; `assignee` for follow-ups) |
| `page` | pagination; costs a call |
**Fields used:** `organic_results[]`: `patent_id` (e.g. `patent/US…/en`), `patent_link`, `serpapi_link`, `title`, `snippet`, `priority_date`, `filing_date`, `publication_date`, `inventor`, `assignee`, `publication_number`, `language`, `thumbnail`, `pdf`, `figures`, and **`country_status`** (map of office → `ACTIVE`/`NOT_ACTIVE`, shown in docs sample). Search results **do not include claims**.
**Use of `country_status`:** free pre-screen chip on each candidate (no extra credit). It is a *hint*; the verdict is computed only after details (F2).
Credits: 1 per call.

### 2.2 `google_patents_details` — the legal-status source (F2)

| Param | Use |
|---|---|
| `patent_id` | the `patent_id` from search (e.g. `patent/US…/en`); fall back to publication number form (VERIFY accepted forms) |
**Fields used (from docs):** `title`, `abstract`, `claims[]` (shape VERIFY V9), `publication_number`, `application_number`, `priority_date`, `filing_date`, `publication_date`, `inventors[]`, `assignees[]`, `classifications[]` (CPC), **`worldwide_applications{<year>:[{filing_date, country_code, application_number, document_id, legal_status_cat, legal_status, this_app}]}`**, **`legal_events[]{date, code, title, attributes[]}`** (docs sample: `FEPP` "Fee payment procedure"), `family_id`, `events[]`, `external_links[]`, `child_applications`, `parent_applications`, `priority_applications`, `applications_claiming_priority`, `patent_citations{original, family_to_family}`, `cited_by{original, family_to_family}`, `non_patent_citations`, `similar_documents`, `description_link`, `pdf`.
Observed value in docs sample: `legal_status_cat: "active"`, `legal_status: "Active"`. **Other values must be collected from real responses (V6)** and recorded in `docs/STATUS_VOCAB.md`; the status engine treats any unseen value as *unrecognised → UNCERTAIN*.
Credits: 1 per call. Re-scan uses `no_cache=true`.

### 2.3 `google_shopping` — who still sells it (F3)

| Param | Use |
|---|---|
| `q` | user-editable product query (default: the search query/mechanism), e.g. `centrifugal governor` |
| `google_domain` | `google.co.in` |
| `gl` / `hl` | `in` / `en` |
| `location` | optional Indian city string from the Locations API (free) |
| `small_business` | optional toggle (`true`) — extra call, MSME angle (VERIFY semantics on first call) |
| `min_price`/`max_price`/`sort_by`/`free_shipping`/`on_sale`/`device` | not used in MVP |
`start` is ignored by this engine (docs).
**Fields used:** `shopping_results[]`: `position`, `title`, `product_id`, `product_link`, `source` (seller), `price`, `extracted_price`, `rating`, `reviews`, `snippet`, `extensions`, `delivery`, `immersive_product_page_token`.
**Derived facts (deterministic):** `n_results`, `n_distinct_sellers`, `price_min/median/max` of `extracted_price` (with currency parsed from `price` string — VERIFY; show "mixed currency" if > 1), `top_titles[5]`, `top_sellers[5]`.
Caveat: shopping results are *products matching the query*, not proof that they implement the patented mechanism → the UI says "products matching '<query>'" and lets the user refine the query; the brief says "listings match", never "use the patent".
Credits: 1.

### 2.4 `google_maps` — who makes it near you (F4)

| Param | Use |
|---|---|
| `engine=google_maps`, `type=search` (required) | |
| `q` | `<mechanism> manufacturer` (editable) |
| `ll` | `@lat,lon,zoom` for the chosen city (from `data/cities.json` or Locations API — VERIFY); or `location` text |
| `google_domain`, `hl`, `gl` | `google.co.in`, `en`, `in` |
| `start` | 0, 20, … (steps of 20) — MVP: first page only |
| `min_rating`, `open_state` | not used |
**Fields used:** `local_results[]`: `title`, `place_id`, `data_id`, `data_cid`, `gps_coordinates`, `rating`, `reviews`, `type`, `address`, `phone`, `operating_hours`, `website` (VERIFY V10), `reviews_link`.
**Derived facts:** `n_places`, `types` histogram, `rating` summary, up to 5 listed makers with address; links to `place_id` pages. Store only business-listing metadata (public business info); no reviews text.
Credits: 1.

### 2.5 `google_scholar` — modern literature (F5)

`q` = mechanism terms (+ optional `"improved"`/`"novel"` not added automatically), `as_ylo` = (current year − 10) computed at runtime, `num=10`, `as_sdt=0`, `hl=en`. Fields: `organic_results[]` title/link/snippet, `publication_info.summary`, `inline_links.cited_by.total`. Facts: top 5 recent papers, total results count (`search_information.total_results`). Credits: 1.

### 2.6 `google_news` — signals (F6, P1)

`engine=google_news`, `q="<assignee or mechanism>" …` (can use `when:` operator inside `q`; **`q` cannot be combined with advanced params** such as tokens), `gl`, `hl`. **Response shape per docs:** `news_results[]` each with `title`, `link`, `source{name, authors[]}` (an **object**), `date`, `iso_date`; the baseline code may assume a different shape (V11). Facts: `n_items`, latest `iso_date`, top 3 titles+sources. Credits: 1.
(`engine=google` with `tbm=nws` is an alternative returning `news_results[]` with `published_at`; choose one and fixture it.)

## 3. Per-feature credit table

| Feature | Calls | Credits | Cached by us? |
|---|---|---|---|
| Discovery search | 1 (+1 per extra page) | 1 | yes (key = engine+params) |
| Status dossier for one patent | `google_patents_details` ×1 | 1 | yes (TTL long; re-scan bypasses) |
| Market (shopping + maps) | 2 | 2 | yes (TTL short) |
| Literature | 1 | 1 | yes |
| News | 1 | 1 | yes |
| **Full brief for one patent** | | **5** (+1 for the discovery search shared across candidates) | |
| Re-scan (status + shopping + maps + news; `no_cache=true`) | 4 | 4 | writes new cache entries |

Cost preview shown before any live run; **no automatic calls on page load; no per-result loops.**

## 4. Budget plan for a 250-credit month (hourly cap 50)

| Purpose | Credits |
|---|---|
| Feasibility test (§7): 2 discovery + 3 details + 2 shopping + 2 maps + 2 scholar + 2 news | 13 |
| Demo fixtures: 4 mechanisms × (1 discovery + 2 details + 4 market/lit/news) | 28 |
| Re-scan fixture (1 mechanism, `no_cache`, 4 calls) | 4 |
| Eval label set: 40 patents × details | 40 |
| Eval discovery queries to assemble the set | 8 |
| Status-vocabulary harvest (extra details across statuses/jurisdictions) | 20 |
| Live UI trials / screenshots | 30 |
| Retries / re-records | 20 |
| **Planned total** | **≈ 163** |
| Reserve | ≈ 87 |

Hard caps in code: `SERPAPI_MONTHLY_HARD_CAP=240`, per-brief cap 8, per-day cap on the public instance (§03 §11). When capped: serve cached/replay content and say so.

## 5. Caching, ledger, redaction

| Layer | Key | Store | TTL (config) |
|---|---|---|---|
| Raw responses | `sha256(engine + canonical sorted params without api_key)` | Postgres `serpapi_cache` (or `.data/cache` in file mode) | patents/details 30 days; scholar 14 days; shopping/maps/news 24 h; fixtures: ∞ |
| In-flight dedupe | same key | in-process Map | call duration |
| Ledger | every call incl. cache hits | `serpapi_calls` (or JSONL) | permanent |
Fields: `call_id, scan_id, patent_id, engine, params_redacted, search_metadata_id, json_endpoint, http_status, credits (0 for cache hit), cache_hit, latency_ms, created_at, raw_key, sha256_raw`.
Redaction: `api_key` never stored/logged; tests assert it. **Remove the current debug logs** that print key presence/length.

## 6. Fixtures and replay

| Item | Rule |
|---|---|
| Layout | `fixtures/<set>/manifest.json`; `fixtures/<set>/serpapi/<engine>/<hash>.json` (redacted); `fixtures/<set>/llm/<hash>.json` (recorded generator/verifier outputs); `fixtures/<set>/scans.json` (recorded scan history for the diff demo) |
| Freeze | `npm run fixtures:freeze -- --set demo` strips `api_key`, thumbnails, long snippets (> 300 chars), tracking params; writes `credits_spent` and library versions to manifest (no dates in names) |
| Replay | `RENAISSANCE_MODE=replay` → transport answers by fingerprint; unknown request → explicit "not in fixture" |
| Truthfulness | Replay banner on every page; receipts show `replay` flag |
| Content hygiene | Only bibliographic/listing metadata and short snippets; no images |

## 7. Feasibility test (≤ 13 credits; do first)

Pick 3 mechanisms (e.g. a governor, a swash-plate pump, a cam-follower linkage — owner's choice).
| Question | Pass | Partial → action | Fail → action |
|---|---|---|---|
| `google_patents` with `before=filing:<cutoff>` returns old grants and `country_status` (V5, V8) | yes | param ignored → use `after/before` on `publication`, or filter client-side with a labelled caveat | no results → rethink queries |
| `google_patents_details` exposes `worldwide_applications.legal_status_cat` + `legal_events` for old US patents (V6, V7) | yes | partial → status confidence capped at "UNCERTAIN" except when two independent signals agree | absent → fall back to `country_status` + term arithmetic with explicit LOW confidence label; reposition honestly |
| `google_shopping` (India domain) returns sellers with `extracted_price` for the mechanism query | ≥ 5 results for 2/3 | sparse → use broader product term; show "few listings" as a *finding* | none → drop F3 from verdict, keep as note |
| `google_maps` returns makers in ≥ 1 industrial city | yes | sparse → try alternative term "<mechanism> supplier" | none → drop F4 |
| `google_scholar` returns recent relevant papers | yes | — | — |
| `google_news` shape matches docs (V11) | yes | adapt | — |
Record results in `docs/FEASIBILITY.md` (no dates).

## 8. Error/rate-limit behaviours the UI must show
Cap reached → remaining facts "skipped (credit cap)"; brief states what it could not check. Hourly limit → pause with resume time. Monthly exhausted → cached/replay only. 5xx → one retry, then fact marked `unavailable` (never silently dropped). Archive 410 → "use the bundle".

## 9. README endpoint table
Only list engines the code actually calls; S3 adapters only if shipped. See `05` §1.


---

<!-- ===== 03-architecture-and-changes.md ===== -->

# 03 — Architecture, Data & Change List (Renaissance)

"Current" facts are from reading the repo at `0db0d36` (VERIFY head). Exact folders under `src/server/` for `patents.ts` and `gemini.ts` were not re-listed here → VERIFY paths with `rg --files src/server`.

## 1. Current architecture (baseline)

```
Browser — React 18 + Vite 6 + Tailwind 3 + react-router 6 + TanStack Query 5
  lib/api.ts  apiQuery/apiMutation → POST {VITE_API_URL}/api/query|mutation/renaissance/:method (all POST)
  Pages: Landing · PatentSearch · Laboratory · Archive · Settings · NotFound
  PatentSearch: runs searchPatents, then AUTO-calls analyzePatentPreview (LLM) for every result, sequentially (2 s gap)
  PatentDetailModal: on open → getPatentDiligence (2 SerpApi credits)
        │
Express 5 — src/server/railway.ts (single file; tsup → dist/server/railway.js; PORT default 3000)
  cors({origin:true}), json limit 8mb, GET /health, NO static serving, NO auth, NO rate limit
  query: searchPatents · getPatentDiligence · getSearchHistory(in-memory) · getArxivPapers(stub []) · getProjects · getProject · analyzePatentPreview
  mutation: createRemixProject · updateProject · deleteProject
        │
  patents.ts  SerpApi: google_patents search (q + " before:<hard-coded year>"), isPatentExpired = filing+20y, claims placeholder,
              getPatentById via search, getPatentDiligenceBrief = google + google_news, opportunityScore = counts formula,
              console.log of key presence/length at module load
  gemini.ts   (OpenRouter/DeepSeek) 3 prompts: modernization (temp 0.7, asks for specifics), blueprint image (cyanotype), gaps preview;
              regex JSON parse; hard-coded fallbacks incl. '442.8 Nm' / '18.2 MPa'; scripted thought log
  Storage     Map → .data/renaissance-projects.json (PROJECT_STORE_PATH), blueprint PNG base64 inside JSON
Deploy: Vercel (client) + Railway (API). Dockerfile node:20-alpine port 3000; railway.json NIXPACKS, healthcheckPath "/" ; vercel.json; render.yaml (stale)
```

## 2. Target architecture

```
              ┌──────────────────────── Railway project ─────────────────────────┐
Browser ────► │ renaissance (one service)  Express 5                               │
              │   /            built SPA (express.static + SPA fallback)            │
              │   /api/v1/*    REST: search, scans, projects, evidence, budget      │
              │   /health      200 when process up (db check optional /health/ready) │
              │   modules:                                                           │
              │     serpapi/   transport(live|record|replay) · cache · ledger ·     │
              │                budget · bucket · redact                              │
              │     patents/   search · details · status(engine) · facts             │
              │     market/    shopping · maps        literature/ scholar            │
              │     news/      google_news adapter                                   │
              │     brief/     facts → generator → verifier(deterministic + LLM)     │
              │     store/     pgStore | fileStore       guards/ access·rate·owner   │
              │     evidence/  bundle + verifier script                              │
              │ Postgres (plugin): owners, projects, scans, serpapi_calls, cache     │
              └────────────────────────────────────────────────────────────────────┘
Local judge run: RENAISSANCE_MODE=replay (default when no SERPAPI key), RENAISSANCE_STORE=file, no DB, no keys
```

Decisions: (1) **one service** serves API + client → no CORS, no Vercel; (2) **REST API** replaces the Modelence-style `query|mutation` adapter (keep a thin compatibility shim only until the client is migrated, then delete); (3) **deterministic engines first, LLM last** — status, facts, numeric checks are pure functions; (4) **store interface** with Postgres and file implementations; (5) **transport abstraction** for record/replay; (6) **no automatic LLM or SerpApi calls** from list views.

## 3. File-level change list

Legend: **N** new · **M** modify · **R** retire (labelled commit; history untouched) · **D** docs.

### 3.1 Server

| Path | Act | Change |
|---|---|---|
| `src/server/railway.ts` | R→split | Replace with `src/server/index.ts` (bootstrap), `app.ts` (Express app factory for tests), `config.ts` (zod-validated env). Delete debug `console.log`s. Keep behaviour of `/health`. Remove `cors({origin:true})` → env allow-list (dev only) |
| `src/server/routes/{health,search,scans,projects,evidence,budget,config}.ts` | N | REST routes (§8) |
| `src/server/serpapi/{client,transport,cache,ledger,budget,bucket,redact,types}.ts` | N | Only SerpApi caller (npm `serpapi` behind `Transport`). Receipts with `search_metadata.id` |
| `src/server/patents/search.ts` | N (from `patents.ts`) | `google_patents` with `before=filing:<cutoff>` etc.; maps `country_status`; **no date arithmetic verdict** |
| `src/server/patents/details.ts` | N | `google_patents_details` adapter → normalised `PatentDetails` (defensive on V6/V7/V9) |
| `src/server/patents/status.ts` | N | **Deterministic status engine** (§4). Pure; no I/O |
| `src/server/patents/vocab.ts` | N | Observed status/code vocabulary (data-driven from `docs/STATUS_VOCAB.md`) |
| `src/server/patents/facts.ts` | N | `statusFacts()`, `patentTextFacts()` |
| `src/server/market/{shopping,maps}.ts` | N | adapters + derived facts |
| `src/server/literature/scholar.ts` | N | adapter + facts |
| `src/server/news/news.ts` | N | adapter (docs shape; V11) + facts |
| `src/server/brief/{facts,prompts,schema,generate,verify,render}.ts` | N | Fact table, generator & verifier prompts, JSON schemas (zod + JSON Schema), numeric-grounding check, markdown/HTML render |
| `src/server/llm/client.ts` | N | OpenRouter/DeepSeek chat with JSON mode, temperature 0, record/replay support |
| `src/server/patents.ts` (old) | R | Delete after parity: `isPatentExpired`, `inferPatentDivision`, `calculateOpportunityScore`, `getPatentDiligenceBrief` |
| `src/server/gemini.ts` (old) | R | Delete: modernization prompt with invented specifics, **all fallback tables incl. `442.8 Nm`/`18.2 MPa`/"40% weight reduction"**, scripted thought log; blueprint-image generator becomes stretch S1 (labelled illustrative) |
| `src/server/store/{index,pgStore,fileStore,migrations/*.sql}.ts` | N | Interface + implementations; file store keeps `.data/` JSON for local |
| `src/server/guards/{accessCode,rateLimit,owner}.ts` | N | §11 |
| `src/server/evidence/{bundle,verify}.ts` + `scripts/verify-bundle.mjs` | N | `renaissance.evidence/1` |
| `src/server/replay/{runner,manifest}.ts` | N | fixtures + compressed progress events |
| `scripts/{freeze-fixtures,secret-scan,budget,eval}.ts` | N | tooling |
| `package.json` | M | name → `renaissance`; scripts `dev`, `build`, `start`, `test`, `typecheck`, `lint`, `eval`, `fixtures:freeze`, `secret-scan`; deps: `serpapi`, `pg`, `pino`, `express-rate-limit`, `zod` (use it), `vitest`, `supertest`, `tsx`; remove unused (VERIFY V14) |
| `tsconfig*.json` | M | remove `.modelence` outDir / `next` plugin leftovers; strict on |
| `Dockerfile`, `railway.json` | M | §12 |
| `vercel.json`, `render.yaml`, `AGENTS.md`, `.cursor/mcp.json` | R/M | Remove Vercel/Render config (single-origin Railway); replace `AGENTS.md` with accurate contributor notes; untrack `.cursor/mcp.json` (`git rm --cached`; keep ignored) |

### 3.2 Client (React 18 + Tailwind 3 — keep stack)

| Path | Act | Change |
|---|---|---|
| `src/client/lib/api.ts` | M | REST client (fetch + TanStack Query); remove `query|mutation` adapter; relative `/api/v1`; owner cookie handled by browser |
| `src/client/pages/LandingPage.tsx` | M | Remove dead `#pricing` link, no-op "Mission Log" form, fixed footer strings, static "STATUS" badges, overclaims ("Deep-learning mining", "Instant CAD generation…"); add honest "how it works" with real counts from fixtures |
| `src/client/pages/PatentSearchPage.tsx` | M | Remove auto `analyzePatentPreview`; show `country_status` chips; cost preview; "Open dossier" |
| `src/client/pages/DossierPage.tsx` | N | Tabs: Status · Market · Literature · News · Brief · Evidence |
| `src/client/pages/LaboratoryPage.tsx` | M→`BriefWorkspace` | Brief editing/export; fake CAD/thought flows removed (VERIFY unread parts) |
| `src/client/pages/ArchivePage.tsx` | M | Saved briefs by owner; re-scan; diff badge (VERIFY unread) |
| `src/client/pages/SettingsPage.tsx` | M | Mode/budget display; no secrets (VERIFY unread) |
| `src/client/components/{StatusStamp,EvidenceChip,ReceiptCard,FactCitation,CreditsMeter,ReplayBanner,SampleChip,DiffPanel,BriefSheet,MarketPanel,MakersMap}.tsx` | N | per `04` |
| `src/client/components/PatentDetailModal.tsx` | R→`DossierPage` | modal shows "EXPIRED - AVAILABLE FOR REMIX" from the 20y guess — remove |
| `src/client/components/ThoughtTerminal.tsx` | M→`EvidenceTicker` | driven by real events; no scripted lines/timestamps |
| `src/client/components/BlueprintCanvas.tsx` | M | S1: render real patent figure (VERIFY unread) |
| `src/client/AppLayout` | M | remove hard-coded `PUBLIC OPERATOR` user; no `/login` navigation |
| `tailwind.config.*`, `index.css` | M | tokens (04); fonts self-hosted (fontsource); remove CSS `@import` of Google Fonts |

### 3.3 Docs / config
`docs/{PRE_EXISTING_WORK,FEASIBILITY,STATUS_VOCAB,EVAL,METHOD,DEV_NOTES,AI_LOG,FINAL_CHECK}.md`, `AI_USE.md`, `NOTICE.md`, `LICENSE` (owner decision; V4), `.env.example` (no values), `.gitignore` (`.env*`, `.data/`, `fixtures/_raw/`), `.github/workflows/ci.yml` (typecheck, lint, test, build, secret-scan).

## 4. Legal status engine (`patents/status.ts`) — deterministic, unit-tested

**Inputs:** `PatentDetails D`, optional search-time `country_status`, `now`, `config`.
**Normalisation (`vocab.ts`):** map `legal_status_cat`/`legal_status` strings to `ACTIVE | NON_ACTIVE | PENDING | UNKNOWN`. Only values observed in real fixtures are mapped (docs sample confirms `active`/`Active`; collect the rest: V6). Any unseen value → `UNKNOWN` and added to `unrecognised[]`.
**Own member:** the `worldwide_applications` entry with `this_app === true` (VERIFY field) or matching `application_number`.
**Term estimate (consistency check only):** `earliest_filing = min(own.filing_date, parent_applications[*].filing_date)` (shapes VERIFY); `term_end_estimate = earliest_filing + 20 years`; `term_elapsed = now > term_end_estimate`. Display as "estimated"; list known adjustment/extension caveats as *not checked* (V18).
**Per-office aggregation:** group members by `country_code`.

| Rule | Condition (for the document's own office) | Verdict | Confidence |
|---|---|---|---|
| R1 | own = ACTIVE | `IN_FORCE` | HIGH |
| R2 | own = NON_ACTIVE ∧ term_elapsed ∧ no ACTIVE/PENDING member in that office ∧ ≥ 1 recognised closing legal event or search-time `country_status`=NOT_ACTIVE | `LIKELY_FREE` | HIGH |
| R3 | own = NON_ACTIVE ∧ term_elapsed ∧ no ACTIVE/PENDING members ∧ no corroborating event | `LIKELY_FREE` | MEDIUM |
| R4 | own = NON_ACTIVE ∧ ¬term_elapsed (lapsed early) | `LAPSED_EARLY` ("appears lapsed; restoration may be possible; verify") | MEDIUM |
| R5 | any ACTIVE/PENDING member in same office (continuation/child/reissue) | `RELATED_ACTIVE` (names the member) | HIGH |
| R6 | own = NON_ACTIVE ∧ latest recognised legal event is a fee/maintenance **after** the estimated term end or events conflict | `UNCERTAIN` | LOW |
| R7 | own = UNKNOWN or details missing | `NOT_ENOUGH_DATA` | — |
| R8 | any unrecognised event code with potential status impact | downgrade one level; list in `unrecognised[]` | — |

**Headline** = own-office verdict; **`other_offices`** lists each family office's verdict (e.g. EP: `IN_FORCE`) so a user building for export sees it. **Never** output a boolean "expired". UI wording: `LIKELY_FREE` → "Appears free to use in {office} (confidence: High). No active family member found in the records retrieved."
**`not_checked[]` (static + dynamic):** other jurisdictions not in the family; design patents; trade marks/trade dress; term adjustments/extensions not visible; reinstatement/restoration after lapse; unpaid-fee grace periods; licences/assignments; data freshness (response `created_at`).
**Output `StatusReport`:**
```ts
{ ownOffice: string; headline: Verdict; confidence: 'HIGH'|'MEDIUM'|'LOW'|null;
  termEstimate: { earliestFiling: string; endEstimate: string; elapsed: boolean; caveat: string };
  members: { office: string; appNo: string; cat: 'ACTIVE'|'NON_ACTIVE'|'PENDING'|'UNKNOWN'; raw: string; thisApp: boolean }[];
  events: { code: string; title: string; date: string; recognised: boolean }[];
  otherOffices: Record<string, Verdict>; rulesFired: string[]; unrecognised: string[]; notChecked: string[];
  evidence: { callId: string; searchMetadataId: string; path: string }[] }
```
Tests: table-driven over ≥ 25 recorded/synthetic `PatentDetails` objects, plus property tests (no code path returns `LIKELY_FREE` when any member is ACTIVE/PENDING in the own office; unseen vocab never yields `LIKELY_FREE` HIGH).

## 5. Fact table and brief pipeline

```
search → candidate list (country_status chips)                           [1 call/query]
open dossier → details(P) [1] → StatusReport                              ┐
            → shopping(q) [1] → market facts                             │ parallel with per-brief cap
            → maps(q, city) [1] → maker facts                            │
            → scholar(q) [1] → paper facts                               │
            → news(q) [1] → news facts (P1)                              ┘
facts = status ∪ patent_text(abstract, claim 1) ∪ market ∪ makers ∪ papers ∪ news   (each: id, key, text, value?, source{callId, engine, searchMetadataId, path})
generate (LLM, temp 0) → draft JSON (claims cite fact ids)
verify:  schema → ids exist → numeric grounding → forbidden phrases → LLM claim check (supported/unsupported) → drop failures
render → BriefSheet (JSON + markdown + print)  ; status line is TEMPLATED from StatusReport (LLM cannot write it)
```
**Fact keys are stable** (e.g. `status.own.verdict`, `market.n_sellers`, `market.price_median`, `makers.n_places`, `lit.n_recent`, `news.latest`), enabling re-scan diffs.
**Numeric grounding (pure function `numbersIn(text)`):** extract numerals (digits with `,`/`.`; ignore fact ids `[F12]` and list indices), normalise (`1,200` → `1200`, `₹`/`%` stripped, spelled-out small numbers ignored), require every numeral in a claim to appear in ≥ 1 *cited* fact's `text`/`value`. Violations → claim removed and counted (`removedByVerifier`).
**Suggestions** (modernisation ideas) are allowed only as `kind:"suggestion"`, with **no numerals**, rendered in a visually distinct "Unverified suggestion" style, each listing `assumptions[]`.

## 6. Data model

### 6.1 SQL (Postgres; also mirrored as JSON in file store)
```sql
create table owners (id uuid primary key, token_hash text not null, created_at timestamptz not null default now());
create table projects (
  id uuid primary key, owner_id uuid references owners(id) on delete cascade,
  title text not null, query text not null, patent_id text not null, city text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table scans (
  id uuid primary key, project_id uuid references projects(id) on delete cascade,
  kind text not null check (kind in ('initial','rescan')), mode text not null,       -- live|replay
  status_report jsonb, facts jsonb not null default '[]', brief jsonb, removed_by_verifier int default 0,
  credits int not null default 0, created_at timestamptz not null default now());
create table serpapi_calls (
  id uuid primary key, scan_id uuid references scans(id) on delete cascade, patent_id text, engine text not null,
  params_redacted jsonb not null, search_metadata_id text, json_endpoint text, http_status int,
  credits int not null, cache_hit boolean not null, latency_ms int, raw_key text, sha256_raw text,
  created_at timestamptz not null default now());
create table serpapi_cache (
  key text primary key, engine text not null, body jsonb not null, search_metadata_id text,
  created_at timestamptz not null default now(), expires_at timestamptz);
create index on scans (project_id, created_at desc);
create index on serpapi_calls (scan_id);
```
(`created_at` = `now()`, timezone-aware — appropriate; no dates stored in repo files.)

### 6.2 TypeScript core types (`src/shared/types.ts`, shared by client & server)
```ts
type Fact = { id: string; key: string; kind: 'status'|'patent_text'|'market'|'maker'|'paper'|'news';
  text: string; value?: number|string; unit?: string; source: { callId: string; engine: string; searchMetadataId: string|null; path: string } };
type BriefClaim = { text: string; factIds: string[] };
type Suggestion = { title: string; component: string; direction: string; kind: 'suggestion'; assumptions: string[]; factIds: string[]; engineeringJudgement: boolean };
type DesignBrief = { schema: 'design_brief/1'; summary: BriefClaim[]; mechanism: BriefClaim[]; marketReality: BriefClaim[];
  suggestions: Suggestion[]; risks: BriefClaim[]; nextSteps: string[]; statusLine: string; removedByVerifier: number };
```

## 7. LLM prompts and JSON schemas (2 LLM steps; both temperature 0, JSON mode, recorded in fixtures)

### 7.1 `design_brief_generator/1`
```
SYSTEM:
You write a one-page design brief for an engineer, using ONLY the facts provided.
Rules:
1. Every sentence you write in summary, mechanism, marketReality and risks MUST list the ids of the facts it relies on (factIds).
2. Do not write any number, percentage, unit value or date unless it appears in a cited fact's text. If unsure, omit the number.
3. Do not state legal status. A separate system writes the status line.
4. Suggestions are ideas, not findings: give 1-3 at most; no numbers; list assumptions; say what fact motivated each (factIds) or set engineeringJudgement=true.
5. Do not use the words: safe, guaranteed, legal to copy, free of risk.
6. Output JSON only matching the schema.
USER:
QUERY: {query}
FACTS: [{"id":"F1","kind":"patent_text","text":"…"}, …]   // max 40, shortest-first within kind
```
JSON Schema (abridged; implement both zod and JSON Schema):
```json
{ "$id":"design_brief_generator/1","type":"object","additionalProperties":false,
  "required":["summary","mechanism","marketReality","suggestions","risks","nextSteps"],
  "properties":{
    "summary":{"type":"array","maxItems":3,"items":{"$ref":"#/$defs/claim"}},
    "mechanism":{"type":"array","maxItems":4,"items":{"$ref":"#/$defs/claim"}},
    "marketReality":{"type":"array","maxItems":5,"items":{"$ref":"#/$defs/claim"}},
    "risks":{"type":"array","maxItems":5,"items":{"$ref":"#/$defs/claim"}},
    "suggestions":{"type":"array","maxItems":3,"items":{"type":"object","additionalProperties":false,
      "required":["title","component","direction","assumptions","factIds","engineeringJudgement"],
      "properties":{"title":{"type":"string","maxLength":80},"component":{"type":"string","maxLength":80},
        "direction":{"type":"string","maxLength":280},"assumptions":{"type":"array","items":{"type":"string"},"maxItems":3},
        "factIds":{"type":"array","items":{"type":"string"}},"engineeringJudgement":{"type":"boolean"}}}},
    "nextSteps":{"type":"array","maxItems":5,"items":{"type":"string","maxLength":160}}},
  "$defs":{"claim":{"type":"object","additionalProperties":false,"required":["text","factIds"],
    "properties":{"text":{"type":"string","maxLength":300},"factIds":{"type":"array","minItems":1,"items":{"type":"string"}}}}}}
```

### 7.2 `claim_verifier/1` (second pass; runs after the deterministic checks)
```
SYSTEM:
You check claims against facts. For each claim, using ONLY its cited facts, answer whether the cited facts support it.
"supported" = facts state it or directly imply it. "partial" = only some of it. "unsupported" = not stated or contradicted.
Do not use outside knowledge. JSON only.
USER:
ITEMS: [{"i":0,"claim":"…","facts":[{"id":"F3","text":"…"}]}, …]
```
```json
{ "$id":"claim_verifier/1","type":"object","additionalProperties":false,"required":["results"],
  "properties":{"results":{"type":"array","items":{"type":"object","additionalProperties":false,
    "required":["i","verdict"],"properties":{"i":{"type":"integer"},"verdict":{"enum":["supported","partial","unsupported"]},
    "note":{"type":"string","maxLength":160}}}}}}
```
Policy: `unsupported` → drop; `partial` → keep but flag "partly supported" in UI; invalid JSON → keep only claims that passed deterministic checks and mark "LLM verification unavailable".
No other LLM use (no property tables, no thought logs, no scores).

## 8. API (REST, `/api/v1`, JSON)

| Method & path | Purpose | Guard |
|---|---|---|
| `GET /health` | liveness (always 200) · `GET /health/ready` db+config check | open |
| `GET /api/v1/config` | `{mode, serpapiEnabled, remainingCredits?, limits}` (no secrets) | open |
| `GET /api/v1/budget` | ledger totals; Account API balance if key present | open (read-only) |
| `POST /api/v1/estimate` | credit estimate for a search/dossier | open |
| `GET /api/v1/search?q=&city=` | discovery (1 credit live; cached/replay free) | live needs access code on public instance |
| `POST /api/v1/scans` `{patentId, query, city}` | start dossier scan → `{scanId}` | live needs code; replay open |
| `GET /api/v1/scans/:id` | progress + status report + facts + brief | owner |
| `POST /api/v1/projects/:id/rescan` | re-scan with `no_cache` for status/market/news | live needs code |
| `GET /api/v1/projects` / `GET /api/v1/projects/:id` / `DELETE …` | saved briefs (owner-scoped) | owner |
| `GET /api/v1/scans/:id/evidence` / `GET …/bundle` | receipts / ZIP | owner |

Owner = anonymous random token in an `httpOnly` cookie (hash stored); no accounts. Errors: RFC-7807-style `{type,title,detail}`.

## 9. Re-scan diff
`diffScans(a,b)` compares facts by `key`: added/removed/changed (numeric deltas computed, e.g. `market.price_median`), status verdict change flagged `alert`. Output rendered in `DiffPanel`. Replay fixtures include a recorded initial + re-scan pair for one mechanism.

## 10. Evidence bundle `renaissance.evidence/1` (ZIP)
```
manifest.json  {schema, project, scan ids, mode, credits_spent, files:[{path,sha256}], engine_versions}
status.json    StatusReport (+ rulesFired)             facts.json   facts with sources
brief.json     DesignBrief + removedByVerifier         serpapi/<call_id>.json (redacted raw; details pruned by json_restrictor-equivalent)
ledger.jsonl   receipts incl. search_metadata_id        verify.mjs   Node, zero deps: re-hash files, re-run status rules on raw details, re-run numeric grounding, print PASS/FAIL
README.txt     how to verify; archive retention note (31 days)
```

## 11. Security, abuse & privacy (public instance)
- **Live gating:** `PUBLIC_DEMO_MODE=true` → every endpoint that can spend credits or call the LLM requires `X-Access-Code` (constant-time compare) unless the request is served from replay/cache. Replay content is always open.
- **Rate limits:** `express-rate-limit` per IP (search/scan), global daily SerpApi cap `DAILY_CREDIT_CAP`, per-brief cap, body limit 256 KB (was 8 MB).
- **Owner scoping:** projects visible only to their anonymous owner token; no listing of others' briefs.
- **Logging:** `pino` with redaction of `api_key`, authorization, cookies; no key-length logging.
- **CORS:** same-origin in production; dev origin allow-list from env.
- **Input:** validate with zod; clamp `num`, query length (≤ 120 chars), allowed cities from a list.
- **Retention:** `RETENTION_DAYS` job deletes projects/scans; delete endpoint.
- **LLM data:** only fact text goes to the LLM; no user free text beyond the query.

## 12. Railway deployment spec

### 12.1 Service topology (cost-conscious)
| Service | Source | Notes |
|---|---|---|
| `renaissance` | repo root `Dockerfile` | Express serves API + built client; healthcheck `/health` |
| `Postgres` | Railway plugin | `DATABASE_URL=${{Postgres.DATABASE_URL}}` |
| (optional S4) `renaissance-rescan` | same image | Railway cron service running `node dist/server/jobs/rescan.js`; must exit when done; cron runs ≥ 5 minutes apart, UTC |
No Redis, no worker, no volume in the default setup.

### 12.2 Dockerfile (replace; multi-stage; non-root)
```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build            # vite build → dist/client ; tsup → dist/server/index.js

FROM node:20-alpine AS run
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
COPY fixtures ./fixtures
COPY src/server/store/migrations ./dist/server/store/migrations
USER node
CMD ["node","dist/server/index.js"]      # listens on process.env.PORT (Railway injects it)
```
(Server must bind `0.0.0.0` and `process.env.PORT`; run SQL migrations on boot, idempotently.)

### 12.3 `railway.json`
```json
{
  "$schema": "https://railway.com/railway.schema.json",
  "build": { "builder": "DOCKERFILE", "dockerfilePath": "Dockerfile" },
  "deploy": {
    "healthcheckPath": "/health",
    "healthcheckTimeout": 120,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 5
  }
}
```
Railway facts used: Dockerfile is always preferred when present; default builder for new services is Railpack (the baseline file says NIXPACKS — remove to avoid confusion); healthcheck passes on any 2xx, runs only at deploy time, uses the injected `PORT`, and requests come from host `healthcheck.railway.app`; Config-as-Code is flagged deprecated in favour of Infrastructure-as-Code but works for existing services (VERIFY when deploying).
**Fix for the baseline mismatch:** old `healthcheckPath "/"` returned 404 because Express served only `/health` — new config and `app.get('/health')` agree. With the client now served by Express, `/` also returns 200.

### 12.4 Variables
```
NODE_ENV=production
RENAISSANCE_MODE=live              # live | replay | record
PUBLIC_DEMO_MODE=true
ACCESS_CODE=<secret>
SERPAPI_API_KEY=<secret>
SERPAPI_MONTHLY_HARD_CAP=240   DAILY_CREDIT_CAP=15   BRIEF_CREDIT_CAP=8   SERPAPI_MAX_PER_HOUR=40
OPENROUTER_API_KEY=<secret>   OPENROUTER_MODEL=<model slug>        # LLM; DEEPSEEK_* alternative as in baseline
DATABASE_URL=${{Postgres.DATABASE_URL}}
RENAISSANCE_STORE=pg               # pg | file
RETENTION_DAYS=14
DEFAULT_CITY=Pune
LOG_LEVEL=info
```
Template syntax `${{ServiceName.VAR}}` references another service's variable; services in a project can also talk over `<service>.railway.internal`. Railway-provided `RAILWAY_GIT_COMMIT_SHA` can be shown in the footer as the build id.

### 12.5 Cost notes
Railway bills per-second usage (RAM ≈ $10/GB-month, CPU ≈ $20/vCPU-month, egress ≈ $0.05/GB; build is free; Hobby plan has a monthly fee that includes the same amount in usage — VERIFY on the pricing page). One small Node service + small Postgres is the cheapest sane footprint; avoid always-on workers and Redis; keep `pino` at `info`. Postgres cache of SerpApi responses prevents repeat spend.

### 12.6 Judge runs locally (no keys, no DB)
```bash
git clone … && cd renaissance
npm ci
npm run dev           # RENAISSANCE_MODE=replay when no SERPAPI_API_KEY; RENAISSANCE_STORE=file; http://localhost:5173 (API :3000)
# or: docker build -t renaissance . && docker run -p 3000:3000 -e RENAISSANCE_MODE=replay renaissance   → http://localhost:3000
```
Live mode: add `SERPAPI_API_KEY` (+ LLM key). A cost preview appears first.

## 13. Tests

| Test | Type |
|---|---|
| `status.test.ts` | table-driven (≥ 25 cases) + property tests (§4) |
| `vocab.test.ts` | unseen values → UNKNOWN, never HIGH-confidence free |
| `serpapi-client.test.ts` | mock transport: success, cache hit 0 credits, 429 hourly/monthly, 5xx single retry, 401, cap refusal, redaction (no key in cache/ledger/log) |
| `adapters.*.test.ts` | fixtures for patents search/details, shopping, maps, scholar, news (shape per docs; V11 object `source`) |
| `facts.test.ts` | keys stable, ids deterministic |
| `grounding.test.ts` | numeric grounding accepts cited numbers, rejects invented ones (`442.8 Nm` must fail) |
| `brief-verify.test.ts` | recorded generator outputs → verifier drops/keeps expected |
| `diff.test.ts` | re-scan diff cases |
| `guards.test.ts` (supertest) | access code required in public mode; replay open; rate-limit; owner scoping |
| `bundle.test.ts` | build → `verify.mjs` PASS; tamper → FAIL |
| `no-invented-numbers.test.ts` | repo-wide grep test: forbids strings like `Nm'`, `MPa'` literals in server code and fallbacks |
| `no-debug-logs.test.ts` | forbids `console.log` in server (use pino) |
| client | `tsc --noEmit` + build; optional Vitest for `StatusStamp`/`FactCitation` |
CI: no network, no secrets.

## 14. Evaluation (small, honest)
**Label set** `eval/labels.jsonl` (≈ 40 patents sampled across 4–6 mechanisms, filing ≥ 20 years old, US-heavy; include some with continuations, some lapsed early, a few still in force):
```json
{"id":"p001","patentId":"patent/US…/en","humanStatus":"expired_term|lapsed_fee|in_force|related_active|unknown",
 "humanSources":["https://patents.google.com/…","<office status page url>"],"notes":"…","verifiedBy":"human"}
```
Human labels come from Google Patents page + the office's status page (VERIFY which office tools to use); keep URLs. **Compare:** (A) naive rule `filing + 20y < now`; (B) engine headline. **Metrics (Wilson 95 % CIs):** false-free rate (system says free, human says in force/related active), miss rate (system not-free, human says expired), uncertainty rate, agreement with human on `LIKELY_FREE`, naive-vs-engine disagreement count. **Grounding audit:** generate briefs for 10 patents from recorded LLM outputs → count uncited numerals (must be 0); report the baseline's fallback tables' numeric claims for contrast (derived by running the retained baseline code from the tag on the same inputs; all are untraceable by construction). Output `eval/report.json` → README + `/evaluation` page. Publish unfavourable results as they are.

## 15. Build phases (order only)
1 Baseline, hygiene, secrets → 2 Server restructure + SerpApi core → 3 Real legal status → 4 Market & literature evidence → 5 Facts + cited brief → 6 Persistence, scans, change tracking → 7 Evidence bundle + replay → 8 Eval → 9 UI refresh → 10 Railway → 11 Docs & submission. Prompts: `06`.


---

<!-- ===== 04-ui-design-spec.md ===== -->

# 04 — UI & Design Spec: Renaissance "Specification Sheet on the Drafting Table"

Scope: refresh the existing **React 18 + Vite 6 + Tailwind 3.4 + react-router 6 + TanStack Query 5 + lucide-react** client. **Do not migrate frameworks or Tailwind major version.** Style inspiration only — no assets, code or copy taken from reference sites.

## 1. Inspiration sites (actually fetched while writing this pack)

### 1.1 Primary: **Vitsœ** — https://www.vitsoe.com/gb (restraint, honesty, product-sheet calm)
Observed in fetched page/CSS: very light neutral surfaces (`#f0f0f0`, `#c2c2c2` hairlines/greys, white), a single strong red accent (`#e4312a`) and a secondary blue (`#0073b1`) for links; a Univers-class grotesque (declared as "Linotype Univers"); plain-spoken copy under headings such as "Honest pricing" and "Lifelong service"; products described in short factual sentences.
**Borrow (style only):** neutral paper surfaces + one red accent; hairline rules; calm, factual headings; "honest" tone → our "Not legal advice / not checked" lists.

### 1.2 Secondary: **teenage engineering** — https://teenage.engineering (instrument-spec density)
Observed: near-black ground (`#121114`), light grey text (`#c5c6cd`), deep ink (`#231f20`), single red accent (`#ed2024`), tiny lowercase product labels, spec-like terse text, custom techno typefaces.
**Borrow (style only):** dense spec-list rhythm, tiny uppercase/lowercase mono labels, one red signal colour on a dark ground.

### 1.3 Existing identity (kept): cyanotype blueprint workspace
Dark navy `#0a192f` / `#002147`, technical white `#E0E0E0`, manila `#F5F5DC` cards, amber `#ffb100`, JetBrains Mono + Space Grotesk, metal-plate buttons, rulers/drafting frame.

### 1.4 Concept: **"The dossier is a datasheet; the app is the drafting table."**
Keep the dark blueprint **table** (continuity, memorable) but make the **artifact** — the brief — a calm light **datasheet** (Vitsœ neutrals, red stamp) that sits on the table and prints cleanly. Cyan/amber remain for app chrome; red is reserved for "not free / caution" stamps. This visually says: *the blueprint is the workspace; the paper is the evidence.*

## 2. Design tokens

### 2.1 Colour (extend `tailwind.config.js`)
| Token | Hex | Use |
|---|---|---|
| `table.900` | `#0a192f` | app background (existing) |
| `table.800` | `#002147` | panels (existing) |
| `table.700` | `#12294a` | raised panel (new) |
| `line` | `#2b4a73` | hairlines on dark |
| `tech` | `#E0E0E0` | text on dark (existing) |
| `tech-dim` | `#9fb0c8` | secondary text on dark |
| `amber` | `#ffb100` | focus, active tab, CTA (existing) |
| `paper` | `#f0f0ed` | datasheet surface (Vitsœ-neutral) |
| `paper-2` | `#e6e6e1` | datasheet bands |
| `ink` | `#16181d` | datasheet text |
| `rule` | `#c2c2c2` | datasheet hairlines |
| `stamp-red` | `#d92b25` | IN_FORCE / RELATED_ACTIVE stamps (tuned to AA on paper) |
| `stamp-green` | `#1f7a55` | LIKELY_FREE stamp |
| `stamp-amber` | `#a15c00` | LAPSED_EARLY / UNCERTAIN stamp |
| `stamp-grey` | `#5b6470` | NOT_ENOUGH_DATA |
| `serp` | `#2f6fdd` | SerpApi receipt chips |
| `sample` | `#7c3aed` | "Sample data"/"Replay" chip |
(Hex values for `paper`, `ink`, `stamp-*`, `serp`, `sample`, `table.700`, `line`, `tech-dim` are ours; the neutrals and red are *inspired by* the fetched sites, not copied assets.)

### 2.2 Typography (self-host via `@fontsource/*`, OFL — needed for offline replay)
| Role | Font | Use |
|---|---|---|
| UI / headings | Space Grotesk (existing) | grotesque, Univers-like feel |
| Data / labels | JetBrains Mono (existing) | ids, params, receipts, labels (uppercase, tracking 0.08em) |
| Datasheet body | Space Grotesk 400 | 15 px / 1.55 |
| Marginalia (optional) | Nanum Pen Script (existing) | very sparingly for hand-drawn annotations on figures; drop if unused (V14) |
Scale: 11 (labels) / 13 / 15 / 18 / 24 / 36 / 56 (hero). Remove CSS `@import` of Google Fonts.

### 2.3 Shape, space, texture
Radius 2 px (instrument feel); metal-plate buttons only for primary CTAs; vellum noise overlay at ≤ 4 % opacity on the dark table only (never on paper); hairlines 1 px; 8-pt spacing grid; datasheet corner registration marks (CSS borders).

### 2.4 Tailwind 3 config snippet
```js
// tailwind.config.js (extend)
theme: { extend: {
  colors: {
    table: { 900:'#0a192f', 800:'#002147', 700:'#12294a' },
    line:'#2b4a73', tech:'#E0E0E0', 'tech-dim':'#9fb0c8', amber:'#ffb100',
    paper:{ DEFAULT:'#f0f0ed', 2:'#e6e6e1' }, ink:'#16181d', rule:'#c2c2c2',
    stamp:{ red:'#d92b25', green:'#1f7a55', amber:'#a15c00', grey:'#5b6470' },
    serp:'#2f6fdd', sample:'#7c3aed'
  },
  fontFamily: { ui:['"Space Grotesk"','system-ui','sans-serif'], mono:['"JetBrains Mono"','ui-monospace','monospace'] },
  keyframes: {
    stampIn:{ '0%':{opacity:0,transform:'scale(1.25) rotate(-6deg)'}, '100%':{opacity:1,transform:'scale(1) rotate(-2deg)'} },
    tickIn:{ '0%':{opacity:0,transform:'translateY(4px)'}, '100%':{opacity:1,transform:'none'} },
    drawRule:{ '0%':{transform:'scaleX(0)'}, '100%':{transform:'scaleX(1)'} }
  },
  animation: { stampIn:'stampIn 200ms ease-out both', tickIn:'tickIn 160ms ease-out both', drawRule:'drawRule 280ms ease-out both' }
}}
```
Print CSS (`index.css`):
```css
@media print {
  body { background:#fff; color:#000; }
  .no-print, nav, .app-chrome { display:none !important; }
  .brief-sheet { box-shadow:none; margin:0; width:auto; }
  @page { size: A4; margin: 14mm; }
  .avoid-break { break-inside: avoid; }
}
@media (prefers-reduced-motion: reduce) { *{ animation-duration:.01ms !important; transition-duration:.01ms !important } }
```

## 3. Signature elements

### 3.1 `StatusStamp` — the verdict as a rubber stamp
| Verdict | Label | Colour | Icon (lucide) |
|---|---|---|---|
| `LIKELY_FREE` | APPEARS FREE TO USE | `stamp.green` | `BadgeCheck` |
| `LAPSED_EARLY` | LAPSED — VERIFY RESTORATION | `stamp.amber` | `Clock` |
| `RELATED_ACTIVE` | RELATED FILING ACTIVE | `stamp.red` | `GitBranch` |
| `IN_FORCE` | IN FORCE | `stamp.red` | `ShieldAlert` |
| `UNCERTAIN` | UNCERTAIN | `stamp.amber` | `HelpCircle` |
| `NOT_ENOUGH_DATA` | NOT ENOUGH DATA | `stamp.grey` | `CircleSlash` |
Below the stamp: confidence (High/Medium/Low) as three bars, the office, and "Estimated term end: {{computed}} (estimate)". Border style: 2 px outlined rectangle, slight rotation −2°, uppercase mono. Always paired with text (never colour-only).

### 3.2 `FactCitation` — `[F7]` chips
Inline superscript chips in the brief. Hover/focus → popover showing fact text, source engine, and receipt (`search_metadata.id`). Click → scrolls the Evidence tab to that fact. In print: converts to superscript numbers with a footnote list.

### 3.3 `EvidenceTicker` (replaces scripted ThoughtTerminal)
A mono terminal strip that prints **real events only**, one per SerpApi call or pipeline step: `google_patents_details ▸ US… ▸ id 6a1f… ▸ 1 credit` … `verifier ▸ dropped 2 claims (uncited numerals)`. No fake timestamps, no scripted lines.

## 4. Pages & ASCII wireframes (desktop 1280)

### 4.1 `/` Landing
```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ▌RENAISSANCE   Search   Archive   Method   Evaluation   [Replay demo]          │
├──────────────────────────────────────────────────────────────────────────────┤
│ OLD MECHANISMS, NEW BRIEFS                                                   │
│ Is it really free to use?                                ┌───datasheet────┐  │
│ Renaissance checks the legal records, shows who still    │ ▣ APPEARS FREE │  │
│ sells it, and writes a one-page brief where every claim  │   High · US    │  │
│ has a receipt.                                           │ Sellers  {{n}} │  │
│ [Search expired patents]  [Open a recorded example]      │ Makers   {{n}} │  │
│                                                          │ [F1][F4][F7]   │  │
│                                                          │ SAMPLE DATA    │  │
│                                                          └────────────────┘  │
├──────────────────────────────────────────────────────────────────────────────┤
│ 01 Verify, don't guess    02 Is anyone still making it?    03 Claims with receipts│
│ status from legal records market + makers near you          zero uncited numbers  │
├──────────────────────────────────────────────────────────────────────────────┤
│ Honest limits: not legal advice · what we did not check · replay vs live      │
└──────────────────────────────────────────────────────────────────────────────┘
```
Remove: pricing link, newsletter form, fixed-date footer strings, static VERIFIED/DEPLOYED badges, "Deep-learning mining", "Instant CAD…". The hero datasheet is the real component fed from a recorded fixture and tagged **Sample data**.

### 4.2 `/search` Candidates
```
┌ Search: [centrifugal governor      ] City [Pune ▾]   est. 1 credit · balance {{n}} ┐
├──────────────────────────────────────────────────────────────────────────────┤
│ US…B  "Governor for engines"  Assignee · filing {{yyyy}}                      │
│   chips: US ○not active  EP ○not active  (hint from search; verdict needs dossier)│
│   [Open dossier · 1 credit]                                                   │
│ …                                                                            │
└──────────────────────────────────────────────────────────────────────────────┘
```
No automatic LLM calls. Chips are labelled "hint".

### 4.3 `/dossier/:scanId` (tabs: Status · Market · Literature · News · Brief · Evidence)
```
┌ Governor for engines · US… ─────────── [LIVE|REPLAY] ─ credits 5/8 ─ [Re-scan] ┐
│ ┌ STATUS ────────────────────────────┐ ┌ FAMILY ─────────────────────────────┐ │
│ │  ╔═ APPEARS FREE TO USE ═╗  High   │ │ US  this application   non-active   │ │
│ │  ╚══════════════════════╝          │ │ EP  related            non-active   │ │
│ │  Estimated term end (estimate)     │ │ JP  related            unknown      │ │
│ │  Rules fired: R2                   │ │ Events: [code] title (recognised)   │ │
│ │  Not checked ▾ (7)                 │ └─────────────────────────────────────┘ │
│ │  [F1][F2][F3]  receipts ▸          │                                         │
│ └────────────────────────────────────┘                                         │
│ Disclaimer bar: Informational only — not legal advice.                         │
└──────────────────────────────────────────────────────────────────────────────┘
```
Market tab:
```
SELLERS  products matching "centrifugal governor" (India)     [F10]
  price  min ₹{{ }} ──●median──── max ₹{{ }}   {{n}} listings · {{n}} sellers
  top sellers: …        [edit query ▸] (re-runs shopping, 1 credit)
MAKERS NEAR Pune  [F14]  list with rating · reviews · type · address   [dot-cloud plot, no map tiles]
```
Literature and News tabs: ranked lists with source, cited-by (scholar), `iso_date` (news), each with a `[Fx]` id and receipt.

### 4.4 Brief sheet (the deliverable; also `/brief/:id`, printable)
```
┌ DESIGN BRIEF ───────────────────────────── ▢ registration marks ─────────────┐
│ Mechanism: Centrifugal governor        Prepared from public records · {{build id}} │
│ ───────────────────────────────────────────────────────────────────────────  │
│ STATUS     ▣ APPEARS FREE TO USE · US · confidence High   (generated by rules, not AI) │
│ SUMMARY    …sentence [F1][F5]                                                 │
│ MECHANISM  …[F2]                                                              │
│ MARKET     {{n}} listings from {{n}} sellers; median ₹{{ }} [F10]; {{n}} makers near Pune [F14] │
│ SUGGESTIONS (unverified ideas)  1. … assumptions: …   2. …                    │
│ RISKS & UNKNOWNS  related filings · not checked: jurisdictions, design patents…│
│ NEXT STEPS ☐ … ☐ …                                                            │
│ ───────────────────────────────────────────────────────────────────────────  │
│ SOURCES  [F1] google_patents_details · id 6a1f… · [F2] …                      │
│ Not legal advice. Verify with a patent attorney. Removed by verifier: {{n}} claims │
└──────────────────────────────────────────────────────────────────────────────┘
```
All `{{ }}` are runtime values; never static. Suggestions use a hatched background and the label "Unverified suggestion".

### 4.5 `/archive` Saved briefs + re-scan diff
```
Saved briefs  [owner-only]                         ┌ What changed since last scan ───────────┐
 • Governor…  last scan {{relative}}  [Re-scan]    │ ⚠ Status: unchanged                    │
                                                   │ ↗ Median price: ₹{{old}} → ₹{{new}}     │
                                                   │ + 1 new news item  (source, link)       │
                                                   └──────────────────────────────────────────┘
```
Use relative phrasing from timestamps at runtime ("3 days ago") — no literal dates in code comments/docs.

### 4.6 `/evaluation`, `/method`
`/evaluation`: table from `eval/report.json` (naive rule vs engine: confusion matrix, false-free rate with CI, grounding audit). Empty state "no report yet". `/method`: how status is derived (rules R1–R8 plain-language), what is not checked, how facts and receipts work, privacy.

### 4.7 Credits meter / mode / replay
Header chip: `LIVE · 5/8 this brief · month {{used}}/240` or `REPLAY · no credits spent`. Banner in replay: "You are viewing a recorded scan. Data was retrieved through SerpApi when recorded; nothing here is fetched now."

## 5. Components

| Component | States | Notes |
|---|---|---|
| `StatusStamp` | 6 verdicts × confidence | `role="status"`, text + icon |
| `EvidenceChip` / `FactCitation` | default, hover, focus, print | keyboard-focusable |
| `ReceiptCard` | live, cached, replay, archive-expired, error | shows `search_metadata.id`; no key |
| `FamilyTable` | rows by office; unrecognised events flagged | |
| `MarketPanel` | loading, sparse (< 5 listings → "few listings" is a finding), error, capped | price strip as inline SVG |
| `MakersList` + dot plot | empty, ok | no basemap tiles (offline) |
| `LiteratureList`, `NewsList` | empty/ok/error | |
| `BriefSheet` | draft, verified, partially verified, LLM-unavailable | print layout |
| `DiffPanel` | no changes / changes / alert | |
| `CreditsMeter`, `ReplayBanner`, `SampleChip`, `AccessCodeDialog` | | |
| `EvidenceTicker` | streaming, idle | real events only |
| `PatentCard` (modify) | + status hint chips | remove "EXPIRED - AVAILABLE FOR REMIX" text derived from 20y rule |
| `AppLayout` (modify) | remove fake user | |

## 6. Motion
| Moment | Spec |
|---|---|
| Stamp appears | `animate-stampIn` 200 ms, once per verdict change |
| Ticker lines | `animate-tickIn` 160 ms, no typing effect |
| Tab content | fade 120 ms |
| Rule under headings | `animate-drawRule` 280 ms on first view |
| Reduced motion | all instant |

## 7. Accessibility
Contrast ≥ 4.5:1 for all text (check `stamp.amber` on `paper`); stamp/state always has text; keyboard tab order follows tab list; popovers dismiss with `Esc`; `aria-live="polite"` on ticker (throttled); print-friendly datasheet; focus ring 2 px `amber` on dark, `ink` on paper.

## 8. Responsive
≥1024 two-column dossier; 640–1023 stacked cards; <640 single column, tabs become a select, brief sheet scrolls full-width, print remains A4.

## 9. Microcopy (plain, hedged)
| Context | Copy |
|---|---|
| Headline status (free) | "Appears free to use in the US (confidence: High). No active family member found in the records retrieved." |
| Related active | "A related filing in this family is still active: {{office}} {{appNo}}." |
| Lapsed early | "Appears to have lapsed before its estimated term end. Restoration may be possible — verify." |
| Not enough data | "We could not retrieve enough legal data to say." |
| Disclaimer | "Informational only — not legal advice. Status data can be incomplete or out of date." |
| Few listings | "Only {{n}} matching listings found — this mechanism may be rarely sold today, or the query may be too narrow." |
| Suggestions | "Unverified suggestion — an idea, not a finding." |
| Verifier | "Removed {{n}} generated claims that could not be tied to a source." |
Avoid: safe, guaranteed, legal to copy, cleared, "AI-powered insights".

## 10. Empty / loading / error matrix
| State | Behaviour |
|---|---|
| Cap reached | Facts shown as "skipped (credit cap)"; brief says what it could not check |
| Rate limit | Pause banner with resume time |
| Details missing | `NOT_ENOUGH_DATA` stamp, brief still renders other facts |
| LLM unavailable | Show facts table + templated status line; "LLM drafting unavailable" |
| Replay fixture missing | Friendly error with run instructions |
| Public instance, no code | "Live search needs an access code. Replay is open." |

## 11. Asset checklist
Self-hosted fonts; lucide icons (existing); no third-party images; patent figures only from SerpApi responses at runtime (S1) and never saved to fixtures; screenshots for README from replay mode.

## 12. Visual QA checklist
- [ ] No external font/CDN requests in replay.
- [ ] Every number on screen traces to a `[Fx]` or a receipt.
- [ ] Stamps always include text; red appears only on caution verdicts.
- [ ] Print preview of the brief is one A4 page for the demo fixtures (or two max) with footnoted sources.
- [ ] Landing has no dead links or fake badges.
- [ ] 1280 / 768 / 390 widths and reduced motion checked.


---

<!-- ===== 05-readme-and-submission-checklist.md ===== -->

# 05 — README Skeleton & Submission Checklist (Renaissance)

Everything in `{{double braces}}` must be filled with **real, measured values** (eval run, ledger, fixtures). Never ship the braces. Never claim anything the repo does not do.

Organiser facts (hackathon site and rules, read while writing): submit via the website after GitHub sign-in; **public repository** with setup instructions (**Renaissance is currently private → make it public only after the secret/history scan**); demo = screen recording **under 3 minutes** of the project **running locally**, public/unlisted link tested in a private window; form asks for description + track + SerpApi usage explanation, participant details, **whether the project already existed**, AI tools used; existing projects qualify when the SerpApi usage is meaningful and the work can be reviewed; AI use is allowed and does not affect judging; one competitive award per project; a leaked API key can disqualify. Contacts: hackathon → adarsh@serpapi.com; API → contact@serpapi.com.

---

## 1. README.md skeleton (replace the current README; keep its demo link only if the video still reflects the product)

````markdown
# Renaissance

**Is that old mechanism really free to use — and is anyone still making it?**
Renaissance finds old patents, **verifies their legal status from records** (not from a date guess), shows who still sells products matching the mechanism and who makes it near you in India, and writes a **one-page design brief where every claim has a receipt**. Powered by [SerpApi](https://serpapi.com).

> Informational only — **not legal advice**. Patent data can be incomplete or out of date. Renaissance says "appears free to use … no active family member found in the records retrieved," never "safe."

*Built for the SerpApi India Hackathon · Track: Commerce & Market Intel · **Pre-existing project, substantially reworked — see [Pre-existing work](#pre-existing-work-and-what-is-new).***

![Dossier](docs/img/dossier.png)  <!-- real screenshot from replay mode -->

## See it in under 3 minutes (no keys, no database)
```bash
git clone {{repo-url}} && cd renaissance
npm ci
npm run dev        # replay mode by default → http://localhost:5173
```
Replay mode serves **recorded** SerpApi responses and recorded LLM outputs through the same code path as live mode. Pick a recorded mechanism → open the dossier → Status → Market → Brief → export evidence bundle.

### Live mode (optional; spends your SerpApi credits)
```bash
cp .env.example .env   # SERPAPI_API_KEY, OPENROUTER_API_KEY (or DEEPSEEK_*)
RENAISSANCE_MODE=live npm run dev
```
A cost preview is shown first; caps and a cache protect the free plan (250 searches/month, 50/hour).

## How SerpApi is used
| SerpApi engine | Key parameters | What it contributes |
|---|---|---|
| `google_patents` | `q`, `before=filing:<computed cutoff>`, `status=GRANT`, `type=PATENT`, `num` | Candidate discovery; `country_status` hints |
| `google_patents_details` | `patent_id` | **Legal status evidence**: `worldwide_applications[].legal_status_cat`, `legal_events`, family/continuations, citations, claims → deterministic status engine (rules R1–R8) |
| `google_shopping` | `q`, `google_domain=google.co.in`, `gl=in`, `hl=en` | Who still sells matching products: seller count, price range |
| `google_maps` | `type=search`, `q`, `ll`/`location`, `google_domain=google.co.in` | Makers near a chosen Indian city |
| `google_scholar` | `q`, `as_ylo` (computed), `num`, `as_sdt=0` | Recent papers on the mechanism |
| `google_news` | `q` (assignee/mechanism, `when:` operator) | Recent coverage signals |
| `search_metadata` | `id`, `json_endpoint`, `created_at` | A receipt on every fact; stored in evidence bundles |
| Search Archive API / Account API | `/searches/{id}.json`, `/account` | "Open archived search" (31-day retention) · credits meter |

Credits spent on shipped fixtures: **{{N}} / 250** (`fixtures/*/manifest.json`).

## What makes it different
1. **Status from evidence, with uncertainty.** Verdict classes `LIKELY_FREE / LAPSED_EARLY / RELATED_ACTIVE / IN_FORCE / UNCERTAIN / NOT_ENOUGH_DATA` + confidence + "not checked" list. The old "filing + 20 years" guess is gone.
2. **Zero uncited numbers.** The brief generator can only cite fact ids; a deterministic checker removes any claim with a number not in its cited facts; a second pass checks support. Removed: {{n}} claims in the evaluation run.
3. **Market reality.** Sellers and nearby makers, as retrieved.
4. **Re-scan.** See what changed since the last scan.
5. **Receipts.** Every fact → `search_metadata.id`; bundles verify offline (`node verify.mjs`).

## Evaluation (small, honest)
{{table from eval/report.json: naive 20-year rule vs evidence-based status on n hand-labelled patents — false-free rate with 95 % CI, disagreements; grounding audit}}
Labels were made by hand from {{sources}}; limitations: {{...}}. Method: [docs/EVAL.md](docs/EVAL.md).

## Deploy on Railway
One service (API + client) + Postgres plugin — see [deploy notes](docs/RAILWAY.md). The public instance serves replay openly; live search needs an access code to protect credits.

## Pre-existing work and what is new
Renaissance existed before this hackathon. It was first built for a different event on the Modelence framework and later adapted to React/Express with a SerpApi workflow. Baseline: tag `pre-hackathon-baseline` (commit `{{SHA}}`). Everything after the tag is new hackathon work, in prefixed commits. Statement: [docs/PRE_EXISTING_WORK.md](docs/PRE_EXISTING_WORK.md). Compare: `git log pre-hackathon-baseline..HEAD --oneline`.

## AI-use disclosure
See [AI_USE.md](AI_USE.md).

## Limits & ethics
Not legal advice. Jurisdictions beyond those in the retrieved family, design patents, trade marks, term adjustments and licensing are **not checked**. News and listings are signals, not accusations.

## Tests
`npm test` · `npm run eval` (offline) · `npm run secret-scan` · `npm run fixtures:freeze`.

## Licences & credits
{{licence — owner decision}}. Notices in [NOTICE.md](NOTICE.md) (incl. any Modelence-derived scaffold). Visual style inspired by Vitsœ and teenage engineering (no assets or code copied).
````

### Supporting files
`docs/PRE_EXISTING_WORK.md` (§2), `AI_USE.md` (§3), `NOTICE.md`, `docs/FEASIBILITY.md`, `docs/STATUS_VOCAB.md`, `docs/EVAL.md`, `docs/METHOD.md`, `docs/DEV_NOTES.md`, `docs/AI_LOG.md`, `docs/RAILWAY.md`, `docs/FINAL_CHECK.md`, `.env.example` (no values).

---

## 2. `docs/PRE_EXISTING_WORK.md` (and form text)

```markdown
# Pre-existing work

**Renaissance existed before the SerpApi India Hackathon.** The repository's first commit is `53bba0d` ("First commit: Renaissance AI patent modernization tool"). It was first built for a different event {{VERIFY: name}} on the **Modelence** framework (early commits and scaffold files reflect this), then adapted: deployment configs (`8a50863`), a SerpApi product-diligence workflow (`48f4559`), OpenRouter/DeepSeek integration (`1ed2046`) and a Vercel-frontend / Railway-API split (`2e6029c`). The head before hackathon work is `{{SHA}}` (tag: `pre-hackathon-baseline`).

**State at baseline:** patent search via `google_patents`; "expired" inferred as filing date + 20 years; two uncached SerpApi searches per opened patent; a result-count "opportunity score"; a single LLM prompt for modernization ideas with hard-coded fallback values; local JSON-file storage; no authentication.

**New for the hackathon (everything after the tag):**
- Legal-status engine built on `google_patents_details` (family, legal events, continuations) with confidence and a "not checked" list; the 20-year guess removed.
- Market and literature evidence (`google_shopping`, `google_maps`, `google_scholar`, `google_news`) as typed facts.
- Cited design-brief generator with a deterministic numeric-grounding check and an LLM support check; removal of invented-number fallbacks and scripted output.
- SerpApi client with caching, credit governor, ledger and receipts; evidence bundle with offline verifier; record/replay fixtures.
- Re-scan and change tracking; Postgres store; access guards; Railway single-service deployment.
- UI refresh; evaluation set and results page.
History is unmodified: no rewriting, no backdating. Use `git log pre-hackathon-baseline..HEAD`.
```

## 3. `AI_USE.md`
```markdown
# AI-use disclosure
**Tools used:** {{Cursor + model name(s)}} for most code edits and tests; {{assistant(s)}} for research summaries, spec drafting and UI-style research (the spec pack is committed under docs/spec/). The baseline (pre-hackathon) was also built with AI assistance: {{VERIFY and state honestly}}.
**Runtime LLM use:** an LLM via OpenRouter/DeepSeek drafts the design brief from a table of cited facts (`design_brief_generator/1`) and checks claim support (`claim_verifier/1`). The legal-status verdict is produced by deterministic rules, not by an LLM. Recorded outputs are stored as fixtures.
**What I did myself:** chose the product direction and the "no uncited numbers" rule; hand-labelled {{n}} patents against public records for the evaluation; ran the feasibility test with my own SerpApi key; reviewed AI-written changes; decided what to cut.
```

## 4. Submission form answers (draft — adapt to the live form; V15)

| Field | Draft answer |
|---|---|
| Project name | Renaissance |
| Track | Commerce & Market Intel |
| One-liner | Verifies from patent records whether an old mechanism is really free to use, shows who still sells and makes it, and writes a one-page design brief where every claim has a receipt. |
| Description (≈150 words) | Small manufacturers and students could build on old mechanisms but can't quickly tell if the patents are truly free, whether anyone still sells the mechanism, or what to improve. Renaissance searches old patents (`google_patents`), verifies legal status from family and legal-event data (`google_patents_details`) with a deterministic, uncertainty-aware rules engine, checks the market (`google_shopping`) and nearby makers in India (`google_maps`), pulls recent papers (`google_scholar`) and news (`google_news`), and generates a brief in which every sentence cites a fact id with a SerpApi receipt. A verifier removes any claim containing a number that its sources do not contain. Re-scan shows what changed. A replay mode runs the whole product with no keys. It reports its own accuracy against hand-labelled patents versus the naive "20-year" rule. Not legal advice. |
| How SerpApi is used | Six engines whose outputs change the verdict or the brief (README table). Receipts store `search_metadata.id`. Credits: {{N}} on fixtures, hard-capped in code; cache + ledger. |
| Existed before? | **Yes.** First commit `53bba0d`; built first for another event on Modelence, then adapted; SerpApi workflow added in `48f4559`; baseline tag `pre-hackathon-baseline`. Hackathon work = everything after the tag (status engine, market/literature facts, cited brief with verifier, evidence bundle, replay, persistence, Railway, UI, evaluation). |
| AI tools | {{from AI_USE.md}} |
| Repo | {{public URL}} |
| Demo video | {{link}} — local replay run; one live call if keys available |
| Hosted demo | {{Railway URL}} — replay open; live search behind an access code |

## 5. Demo video — what must be visible (under 3 minutes; no script)
1. `npm run dev` → replay banner.
2. Search → candidate chips → open dossier → **Status** stamp with rules fired and "not checked".
3. Market tab (sellers + makers near an Indian city) with receipts.
4. Brief sheet with `[Fx]` citations and "removed by verifier" counter; export bundle; run `verify.mjs`.
5. Re-scan diff; evaluation page (naive vs evidence).

## 6. Judge checklist (final gate)
1. [ ] Repo public (after history/secret scan); opens in a private window; README opens with one-liner + 3-minute run + SerpApi table.
2. [ ] `pre-hackathon-baseline` tag; history untouched; commit prefixes consistent.
3. [ ] Disclosures: `PRE_EXISTING_WORK.md`, `AI_USE.md`, README, form — including the Modelence-origin statement.
4. [ ] No secrets in tree **or history** (`npm run secret-scan` + history scan); any key that ever appeared is rotated.
5. [ ] Debug `console.log` removed (test enforces); logs redact keys.
6. [ ] Every README engine is called in code and covered by a fixture/test.
7. [ ] `search_metadata.id` visible in UI for every fact.
8. [ ] Non-default parameters visible: `before=filing:…`, `google_domain=google.co.in`, `gl=in`, `as_ylo`, `ll`.
9. [ ] Errors/rate limits/credit cap handled visibly.
10. [ ] No invented numbers: grounding test + grep test pass; old fallback tables deleted.
11. [ ] Landing page has no dead links/fake badges/overclaims.
12. [ ] Eval numbers in README equal `eval/report.json`; labels and limits documented.
13. [ ] Railway: healthcheck passes at `/health`; live endpoints gated; Postgres connected; no Vercel/Render leftovers.
14. [ ] Demo video < 3 min, local run, link tested in private window.
15. [ ] `NOTICE.md` lists third-party code/fonts and any Modelence-derived files; licence chosen by owner (V4).

## 7. Risk register
| Risk | Mitigation |
|---|---|
| "Adapted from another hackathon" perception | Full disclosure up front; show substantial new engineering and measured results |
| Status vocabulary incomplete | Data-driven vocab from fixtures; unseen → UNCERTAIN; document in `STATUS_VOCAB.md` |
| Shopping results ≠ users of the patent | Wording "listings matching"; user-editable query |
| Few Indian makers in Maps for niche mechanisms | Treat sparsity as a finding; broaden query suggestions |
| Credit drain on public site | Access code, caps, cache, replay |
| Legal misinterpretation | Banner, hedged wording, not-checked list, no "safe" |

## 8. Draft email to organisers (NOT sent — parent must route through approval)
**To:** adarsh@serpapi.com  **Subject:** Credits question — Renaissance (patents + shopping + maps)
Hello — I'm entering Renaissance, an existing project I'm reworking for the hackathon (disclosed as pre-existing). Building recorded fixtures and a small labelled evaluation needs more `google_patents_details` calls than the 250/month free plan comfortably allows. I cache every response and enforce a hard cap in code. Is extra development credit possible, or only the post-submission credit? Thank you — Aryan Saxena.


---

<!-- ===== 06-cursor-agent-prompts.md ===== -->

# 06 — Cursor Agent Prompts (Renaissance) — copy-paste, in order

How to use: copy this pack to `docs/spec/` in the renaissance repo (commit as "docs: add build specification (AI-assisted)"). Open the repo root in Cursor. Paste **one prompt per session**; finish; verify acceptance; commit; continue. Each prompt begins with the **Common preamble**.

---

## Common preamble (prepend to every prompt)

```
You are modifying the EXISTING repository "renaissance" for the SerpApi India Hackathon. The spec pack is in docs/spec/. Read docs/spec/00-README-for-agent.md first, then the files named in this task.

Hard rules:
1. Pre-existing work: never rewrite history, never backdate, never squash. Prefixed small commits: feat(patents), feat(serpapi), feat(brief), feat(ui), fix(security), chore(railway), test, docs.
2. Never write API keys/tokens into any file or log. Keys only from env via src/server/config.ts. Redact api_key everywhere. Never log key presence or length.
3. SerpApi traffic ONLY through src/server/serpapi/. Tests never use the network (mock/replay transport).
4. NO INVENTED NUMBERS. No hard-coded torque/stress/percent/savings values anywhere. Any number in generated brief text must appear in a cited fact. Delete the old fallback tables.
5. Legal status is never derived from "filing + 20 years" alone. Use the status engine (03 §4). Never output words: safe, guaranteed, legal to copy.
6. No automatic LLM or SerpApi calls from list views or page load. Always show a cost preview before live calls.
7. Everything must run in RENAISSANCE_MODE=replay with no keys, no database, no network. Synthetic test data lives in tests/fixtures/synthetic/ with "synthetic": true and never in fixtures/.
8. Where the spec says VERIFY, implement defensively, and record the answer in docs/DEV_NOTES.md.
9. No dates, deadlines or day-by-day plans in any file you write.
10. After the task: run typecheck, lint, test, build; summarise changes; list spec deviations and VERIFY items resolved/open.
```

---

## Prompt 1 — Baseline, hygiene, secrets, stale files
**Read:** 00 (all), 03 §3.1 (R rows), 05 §1–3.
**Task:** (1) Confirm head; create local annotated tag `pre-hackathon-baseline` (do not push tags unless asked; document the command). (2) Create `docs/PRE_EXISTING_WORK.md`, `AI_USE.md`, `NOTICE.md`, `docs/DEV_NOTES.md` (copy VERIFY register), `docs/spec/` copy of this pack. (3) Add `scripts/secret-scan.ts` (patterns: `api_key=`, `Bearer `, `sk-`, 32–64 hex, `*_API_KEY=` with a value) scanning tracked files **and** an option `--history` that scans `git log -p`; wire to CI and `npm run secret-scan`. Report findings; do **not** rewrite history — if a key is found, list it for rotation. (4) Remove debug `console.log` lines (key presence/length etc.) and add a test forbidding `console.log` in `src/server`. (5) Untrack `.cursor/mcp.json` (`git rm --cached`), replace `AGENTS.md` with accurate contributor notes, remove `.modelence`/`next` leftovers from tsconfig, rename package to `renaissance`, delete `vercel.json` and `render.yaml` in a separate labelled commit. (6) Answer V1–V4, V12, V14 and record.
**Acceptance:** secret scan passes on tree and flags a planted bad string in a unit test; `--history` runs and reports; build still works; no `console.log` in server; `docs/DEV_NOTES.md` has the answers; tag exists locally.

---

## Prompt 2 — Server restructure + SerpApi core
**Read:** 02 §1, §5; 03 §2, §3.1, §8, §11 (logging), §13.
**Task:** Split `src/server/railway.ts` into `index.ts`, `app.ts` (factory), `config.ts` (zod env validation), `routes/*`. Keep `/health` returning 200. Add `pino` logging with redaction. Implement `src/server/serpapi/` (client using npm `serpapi` behind a `Transport` interface with `LiveTransport` now; cache; ledger; budget (per-brief, daily, monthly caps); hourly bucket; redaction; receipts with `search_metadata.id`, `json_endpoint`). Provide a **temporary compatibility shim** for the old `query|mutation` endpoints that calls the new modules so the client keeps working until Prompt 9. Replace open CORS with an env allow-list; body limit 256 KB.
**Acceptance (mock transport only):** tests for success, cache hit (0 credits), 429 hourly pause, 429 monthly stop, 5xx single retry, 401, cap refusal, redaction (no key in cache/ledger/logs), in-flight dedupe. `GET /health` works with no env. Existing client still loads search results via the shim.

---

## Prompt 3 — Real legal status
**Read:** 02 §2.1–2.2, §7; 03 §4, §13; 00 V5–V9.
**Task:** Implement `patents/search.ts` (`google_patents` with `before=filing:<runtime cutoff>`, `status=GRANT`, `type=PATENT`, `num`; map `country_status`; **no appended `before:` text**), `patents/details.ts` (adapter for `google_patents_details`; defensive parsing), `patents/vocab.ts` (initially only values proven by fixtures; unseen → UNKNOWN + `unrecognised[]`), and `patents/status.ts` exactly per 03 §4 (rules R1–R8, confidence, term estimate as consistency check only, `notChecked[]`, `otherOffices`, evidence refs). Create synthetic details fixtures covering every rule (labelled synthetic) and add one **real** recorded details response after the feasibility test (owner provides) under `fixtures/`.
**Acceptance:** `status.test.ts` ≥ 25 table cases + property tests (never `LIKELY_FREE` if any ACTIVE/PENDING member in own office; unseen vocab never HIGH-confidence free); no function returns a bare boolean "expired"; grep test confirms the old `isPatentExpired` is gone from server code.

---

## Prompt 4 — Market, literature, news facts
**Read:** 02 §2.3–2.6; 03 §5; 00 V10–V11.
**Task:** Implement adapters + derived-fact builders: `market/shopping.ts` (`google_domain=google.co.in`, `gl=in`, `hl=en`; counts, distinct sellers, min/median/max `extracted_price`, currency parse with mixed-currency flag), `market/maps.ts` (`type=search`, city list in `data/cities.json`, derived makers facts), `literature/scholar.ts` (`as_ylo` computed from runtime year, `num=10`), `news/news.ts` (`google_news` docs shape; `source` is an object; `iso_date`). Enforce per-brief credit cap and make news optional (P1). Fact keys stable (03 §5).
**Acceptance:** adapter tests with fixtures (synthetic + one real per engine when available); sparse results produce facts like `market.n_sellers=2` and a "few listings" flag, never errors; price stats correct on edge cases (single price, equal prices, missing `extracted_price`); no network in tests.

---

## Prompt 5 — Facts table and cited design brief
**Read:** 03 §5, §6.2, §7; 01 F7; 00 rule 4.
**Task:** Implement `brief/facts.ts` (assemble `Fact[]` with ids/keys/sources), `brief/prompts.ts` + `brief/schema.ts` (zod + JSON Schema for `design_brief_generator/1` and `claim_verifier/1`), `llm/client.ts` (OpenRouter/DeepSeek, JSON mode, temperature 0, record/replay hooks), `brief/generate.ts`, `brief/verify.ts` (schema → fact ids exist → **numeric grounding** (`numbersIn`) → forbidden phrases → LLM support check → drop/flag), and `brief/render.ts` (templated **status line from the status engine**, never from the LLM). Remove `gemini.ts` modernization prompt, all fallback tables and the scripted thought log in a clearly labelled commit.
**Acceptance:** `grounding.test.ts` rejects `442.8 Nm`-style invented numerals and accepts numerals present in cited facts; recorded generator outputs with planted violations are cleaned by the verifier (counts match); invalid LLM JSON degrades gracefully (facts + templated status only); `no-invented-numbers.test.ts` passes (no `Nm`/`MPa` literals in server code).

---

## Prompt 6 — Persistence, scans, re-scan diff, guards
**Read:** 03 §6, §8, §9, §11.
**Task:** Implement `store/` (interface; `pgStore` with SQL migrations on boot, `fileStore` for local), owner cookie + hashed token, REST routes (`/api/v1/*`) per 03 §8, scan runner with progress events, `rescan` using `no_cache=true` for status/market/news, `diffScans`, guards (`accessCode` constant-time compare, `rateLimit`, owner scoping, `PUBLIC_DEMO_MODE`), retention job and delete endpoint.
**Acceptance:** `guards.test.ts` (supertest): public mode requires code for live endpoints, replay open, other owner's project returns 404, rate limit trips; `diff.test.ts` cases; both stores pass the same contract test suite; no listing of other owners' briefs.

---

## Prompt 7 — Evidence bundle and replay
**Read:** 03 §10; 02 §6; 05 §5.
**Task:** Implement `evidence/bundle.ts` + `scripts/verify-bundle.mjs` (zero deps: re-hash files, re-run status rules on raw details, re-run numeric grounding), record/replay transports (`RecordTransport`, `ReplayTransport`, request fingerprint minus secrets), `replay/runner.ts` (progress events), `scripts/freeze-fixtures.ts` (sanitise, manifest with `credits_spent`, no dates), default `RENAISSANCE_MODE=replay` when no SerpApi key. Provide a tiny synthetic fixture set for tests; the real recorded set is produced later by the owner.
**Acceptance:** `bundle.test.ts` build → verify PASS; tamper → FAIL; no `api_key` in any bundle; replay of the synthetic set completes without network (sockets stubbed to fail); unknown request in replay gives an explicit error.

---

## Prompt 8 — Evaluation harness
**Read:** 03 §14; 01 §6.
**Task:** Implement `eval/` (label schema + loader with validation, `run.ts`, metrics with Wilson intervals: false-free rate, miss rate, uncertainty rate, naive-vs-engine disagreement; grounding audit; report writer `eval/report.json`; `docs/EVAL.md` table generator). Provide a ≤ 12-row **synthetic** mini label set for tests and a template + procedure for the owner's hand-verified labels (do not fabricate real labels). Add `npm run eval`.
**Acceptance:** `npm run eval -- --set tests-mini` outputs a report offline; metric unit tests on known cases; the README generator refuses to print numbers when `report.json` is missing.

---

## Prompt 9 — UI refresh (specification sheet)
**Read:** 04 (all); 03 §3.2; 01 F12.
**Task:** Implement tokens (Tailwind 3 config + print CSS), self-hosted fonts (remove Google Fonts `@import`), `StatusStamp`, `FactCitation`/`EvidenceChip`, `ReceiptCard`, `FamilyTable`, `MarketPanel`, `MakersList`, `BriefSheet` (print-ready with footnoted sources), `DiffPanel`, `CreditsMeter`, `ReplayBanner`, `SampleChip`, `AccessCodeDialog`, `EvidenceTicker`; new `DossierPage` with tabs; migrate `lib/api.ts` to REST; remove the compatibility shim; fix `PatentSearchPage` (no auto LLM preview; status hint chips; cost preview), `AppLayout` (no fake user/`/login`), `LandingPage` (remove dead link, no-op form, fixed footer strings, static badges and overclaims), `ThoughtTerminal`→`EvidenceTicker`. Keep React 18/Vite 6/Tailwind 3/router 6/TanStack Query. Read the unread pages (V13) before editing them.
**Acceptance:** `tsc --noEmit` + `vite build` pass; no external font/CDN requests in replay; every number on the dossier/brief has a `[Fx]` or receipt; stamps always carry text; print preview of the demo brief fits A4 (≤ 2 pages) with footnotes; landing has no dead links; screenshots from replay saved to `docs/img/`.

---

## Prompt 10 — Railway deployment
**Read:** 03 §12; 00 V12, V17.
**Task:** Replace `Dockerfile` with the multi-stage non-root image (03 §12.2; Express serves `dist/client` + SPA fallback; bind `0.0.0.0:$PORT`; run migrations on boot), replace `railway.json` (builder DOCKERFILE; healthcheck `/health`), add `docs/RAILWAY.md` (services, variables with `${{Postgres.DATABASE_URL}}`, cost notes, Lean setup, local run), add `/health/ready` (DB + config), version footer from `RAILWAY_GIT_COMMIT_SHA`, `.env.example` with all variables and no values.
**Acceptance:** `docker build .` succeeds; `docker run -e PORT=3000 -e RENAISSANCE_MODE=replay` serves `/` and `/health` (both 2xx) with no other env; `config` tests for production validation (missing `ACCESS_CODE` when `PUBLIC_DEMO_MODE=true` fails fast); secret scan clean; no Vercel/Render files remain.

---

## Prompt 11 — Docs, disclosure, final gate
**Read:** 05 (all); 01 §10–12.
**Task:** Write README per 05 §1 using only measured values; finalise `docs/PRE_EXISTING_WORK.md` (incl. the Modelence-origin statement and commit landmarks), `AI_USE.md`, `NOTICE.md` (mention any Modelence-derived scaffold), `docs/FEASIBILITY.md`, `docs/STATUS_VOCAB.md`, `docs/METHOD.md`, `docs/EVAL.md`, `docs/AI_LOG.md`; run the judge checklist (05 §6) into `docs/FINAL_CHECK.md`; run secret scan including `--history`.
**Acceptance:** `grep -R "{{" README.md docs/ AI_USE.md` returns nothing; every engine in the README table appears in code and tests; checklist items 1–15 ticked or explained; typecheck, lint, test, build, secret-scan all green; no dates/timelines in authored docs.
