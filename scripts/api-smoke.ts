/**
 * One-shot REST smoke test. Usage:
 *   RENAISSANCE_MODE=replay tsx scripts/api-smoke.ts
 *   BASE_URL=https://... ACCESS_CODE=... tsx scripts/api-smoke.ts
 */
import request from 'supertest';
import { createApp } from '../src/server/app.js';
import { loadConfig, resetConfigForTests } from '../src/server/config.js';

type Result = { name: string; ok: boolean; status?: number; detail?: string };

async function runLocalReplay(): Promise<Result[]> {
  process.env.NODE_ENV = 'test';
  process.env.RENAISSANCE_MODE = 'replay';
  delete process.env.SERPAPI_API_KEY;
  delete process.env.PUBLIC_DEMO_MODE;
  resetConfigForTests();
  loadConfig(process.env);
  const app = createApp();
  const out: Result[] = [];

  const push = (name: string, status: number, ok: boolean, detail?: string) =>
    out.push({ name: `[replay] ${name}`, ok, status, detail });

  let r = await request(app).get('/health');
  push('GET /health', r.status, r.status === 200);

  r = await request(app).get('/health/ready');
  push('GET /health/ready', r.status, r.status === 200);

  r = await request(app).get('/api/v1/config');
  push('GET /api/v1/config', r.status, r.status === 200 && r.body.mode === 'replay');

  r = await request(app).get('/api/v1/budget');
  push('GET /api/v1/budget', r.status, r.status === 200);

  r = await request(app).get('/api/v1/search').query({ q: 'centrifugal governor' });
  push('GET /api/v1/search', r.status, r.status === 200 && (r.body.hits?.length ?? 0) > 0);

  r = await request(app).post('/api/v1/estimate').send({ kind: 'dossier' });
  push('POST /api/v1/estimate', r.status, r.status === 200 && r.body.credits === 6);

  const agent = request.agent(app);
  r = await agent.post('/api/v1/scans').send({
    patentId: 'US-US4085846-A',
    query: 'centrifugal governor',
    city: 'Pune',
  });
  push('POST /api/v1/scans', r.status, r.status === 202, r.body?.scanId);
  const scanId = r.body.scanId as string;
  const projectId = r.body.projectId as string;

  for (let i = 0; i < 40; i++) {
    await new Promise((res) => setTimeout(res, 250));
    const s = await agent.get(`/api/v1/scans/${scanId}`);
    if (s.body.status === 'complete' || s.body.status === 'failed') {
      push(
        'GET /api/v1/scans/:id (complete)',
        s.status,
        s.status === 200 && s.body.status === 'complete',
        s.body.status,
      );
      break;
    }
    if (i === 39) push('GET /api/v1/scans/:id (timeout)', 0, false, 'pending');
  }

  r = await agent.get(`/api/v1/scans/${scanId}/evidence`);
  push('GET /api/v1/scans/:id/evidence', r.status, r.status === 200);

  r = await agent.get(`/api/v1/scans/${scanId}/bundle`);
  push('GET /api/v1/scans/:id/bundle', r.status, r.status === 200);

  r = await agent.get('/api/v1/projects');
  push('GET /api/v1/projects', r.status, r.status === 200 && Array.isArray(r.body.projects));

  r = await agent.get(`/api/v1/projects/${projectId}`);
  push('GET /api/v1/projects/:id', r.status, r.status === 200);

  r = await agent.get(`/api/v1/projects/${projectId}/diff`);
  push('GET /api/v1/projects/:id/diff', r.status, r.status === 200);

  r = await request(app).post('/api/query/renaissance/searchPatents').send({ query: 'governor' });
  push('POST compat searchPatents', r.status, r.status === 200);

  r = await request(app).post('/api/mutation/renaissance/foo').send({});
  push('POST compat mutation 501', r.status, r.status === 501);

  r = await agent.delete(`/api/v1/projects/${projectId}`);
  push('DELETE /api/v1/projects/:id', r.status, r.status === 204 || r.status === 200);

  return out;
}

async function runRemote(base: string, accessCode: string): Promise<Result[]> {
  const out: Result[] = [];
  const push = (name: string, ok: boolean, status: number, detail?: string) =>
    out.push({ name: `[live] ${name}`, ok, status, detail });

  const headers: Record<string, string> = { 'Content-Type': 'application/json', 'X-Access-Code': accessCode };

  async function req(method: string, path: string, body?: unknown, hdrs?: Record<string, string>) {
    const res = await fetch(`${base}${path}`, {
      method,
      headers: { ...headers, ...hdrs },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    let json: unknown;
    try {
      json = JSON.parse(text);
    } catch {
      json = text.slice(0, 120);
    }
    return { status: res.status, json };
  }

  let r = await req('GET', '/health', undefined, {});
  push('GET /health', r.status === 200, r.status);

  r = await req('GET', '/health/ready', undefined, {});
  push('GET /health/ready', r.status === 200, r.status);

  r = await req('GET', '/api/v1/config', undefined, {});
  push('GET /api/v1/config', r.status === 200, r.status, JSON.stringify(r.json).slice(0, 80));

  r = await req('GET', '/api/v1/budget', undefined, {});
  push('GET /api/v1/budget', r.status === 200, r.status);

  r = await fetch(`${base}/api/v1/search?q=test`);
  push('GET /api/v1/search (no code)', r.status === 401, r.status);

  r = await req('GET', '/api/v1/search?q=centrifugal+governor');
  const hits = (r.json as { hits?: { patent_id: string }[] }).hits ?? [];
  push('GET /api/v1/search', r.status === 200 && hits.length > 0, r.status);

  r = await req('POST', '/api/v1/estimate', { kind: 'dossier' });
  push('POST /api/v1/estimate', r.status === 200, r.status);

  const patentId = hits[0]?.patent_id ?? 'patent/US1836693A/en';
  const scanRes = await fetch(`${base}/api/v1/scans`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      patentId,
      query: 'centrifugal governor',
      city: 'Pune',
    }),
  });
  const setCookie = scanRes.headers.get('set-cookie') ?? '';
  const cookie = setCookie.split(';')[0] ?? '';
  const scanBody = (await scanRes.json()) as { scanId?: string; projectId?: string };
  push('POST /api/v1/scans', scanRes.status === 202, scanRes.status, scanBody.scanId);

  const cookieHdr: Record<string, string> | undefined = cookie ? { Cookie: cookie } : undefined;
  let finalStatus = 'pending';
  for (let i = 0; i < 60; i++) {
    await new Promise((res) => setTimeout(res, 500));
    r = await req('GET', `/api/v1/scans/${scanBody.scanId}`, undefined, cookieHdr);
    finalStatus = (r.json as { status?: string }).status ?? '';
    if (finalStatus === 'complete' || finalStatus === 'failed') break;
  }
  push('GET /api/v1/scans/:id (complete)', finalStatus === 'complete', r.status, finalStatus);

  r = await req('GET', `/api/v1/scans/${scanBody.scanId}/evidence`, undefined, cookieHdr);
  push('GET /api/v1/scans/:id/evidence', r.status === 200, r.status);

  r = await req('GET', `/api/v1/scans/${scanBody.scanId}/bundle`, undefined, cookieHdr);
  push('GET /api/v1/scans/:id/bundle', r.status === 200, r.status);

  r = await req('GET', '/api/v1/projects', undefined, cookieHdr);
  push('GET /api/v1/projects', r.status === 200, r.status);

  return out;
}

async function main() {
  const base = process.env.BASE_URL?.replace(/\/$/, '');
  const code = process.env.ACCESS_CODE ?? '';
  const results: Result[] = [];

  results.push(...(await runLocalReplay()));

  if (base && code) {
    results.push(...(await runRemote(base, code)));
  } else if (base) {
    results.push({ name: '[live] skipped', ok: false, detail: 'set ACCESS_CODE for live smoke' });
  }

  const failed = results.filter((x) => !x.ok);
  for (const r of results) {
    const mark = r.ok ? 'OK' : 'FAIL';
    console.log(`${mark}\t${r.name}\t${r.status ?? ''}\t${r.detail ?? ''}`);
  }
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  if (failed.length) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
