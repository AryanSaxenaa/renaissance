import request from 'supertest';
import { afterEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/server/app.js';
import { resetConfigForTests, loadConfig } from '../src/server/config.js';

describe('guards', () => {
  afterEach(() => {
    resetConfigForTests();
    delete process.env.PUBLIC_DEMO_MODE;
    delete process.env.ACCESS_CODE;
    delete process.env.RENAISSANCE_MODE;
  });

  it('health is open', async () => {
    const app = createApp();
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
  });

  it('replay scans stay open even in public demo mode', async () => {
    process.env.RENAISSANCE_MODE = 'replay';
    process.env.PUBLIC_DEMO_MODE = 'true';
    process.env.ACCESS_CODE = 'demo-code';
    resetConfigForTests();
    loadConfig(process.env);
    const app = createApp();
    const ok = await request(app).post('/api/v1/scans').send({
      patentId: 'US-US4085846-A',
      query: 'centrifugal governor',
      city: 'Pune',
    });
    expect(ok.status).toBe(202);
  });

  it('live public demo requires access code', async () => {
    process.env.RENAISSANCE_MODE = 'live';
    process.env.SERPAPI_API_KEY = 'test-key';
    process.env.PUBLIC_DEMO_MODE = 'true';
    process.env.ACCESS_CODE = 'demo-code';
    resetConfigForTests();
    loadConfig(process.env);
    const app = createApp();
    const denied = await request(app).post('/api/v1/scans').send({
      patentId: 'US-US4085846-A',
      query: 'centrifugal governor',
      city: 'Pune',
    });
    expect(denied.status).toBe(401);
  });

  it('replay mode search open without code', async () => {
    process.env.RENAISSANCE_MODE = 'replay';
    resetConfigForTests();
    loadConfig(process.env);
    const app = createApp();
    const res = await request(app).get('/api/v1/search').query({ q: 'centrifugal governor' });
    expect(res.status).toBe(200);
    expect(res.body.hits?.length).toBeGreaterThan(0);
  });
});
