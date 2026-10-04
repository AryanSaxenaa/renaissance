import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import type { z } from 'zod';
import { getConfig } from '../config.js';
import { logger } from '../logger.js';

export type ChatJsonRequest<T> = {
  promptId: string;
  system: string;
  user: string;
  schema: z.ZodType<T>;
};

function fingerprint(promptId: string, system: string, user: string): string {
  return createHash('sha256').update(`${promptId}|${system}|${user}`).digest('hex');
}

async function loadReplay<T>(dir: string, hash: string, schema: z.ZodType<T>): Promise<T | null> {
  try {
    const raw = await readFile(join(dir, `${hash}.json`), 'utf8');
    const json = JSON.parse(raw) as { output: unknown };
    return schema.parse(json.output);
  } catch {
    return null;
  }
}

async function callOpenRouter(system: string, user: string): Promise<string> {
  const config = getConfig();
  const key = config.OPENROUTER_API_KEY;
  if (!key) {
    throw new Error('llm_unavailable');
  }
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: config.OPENROUTER_MODEL,
      temperature: 0,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  });
  if (!response.ok) {
    throw new Error(`openrouter_${response.status}`);
  }
  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('openrouter_empty');
  return content;
}

export async function chatJson<T>(req: ChatJsonRequest<T>): Promise<T> {
  const config = getConfig();
  const hash = fingerprint(req.promptId, req.system, req.user);

  if (config.mode === 'replay' || !config.OPENROUTER_API_KEY) {
    const replayed = await loadReplay(config.FIXTURES_LLM_DIR, hash, req.schema);
    if (replayed) return replayed;
    throw new Error(`llm_fixture_missing:${hash}`);
  }

  const content = await callOpenRouter(req.system, req.user);
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    logger.warn({ promptId: req.promptId }, 'llm_json_parse_failed');
    throw new Error('llm_invalid_json');
  }
  const validated = req.schema.parse(parsed);

  if (config.mode === 'record') {
    await mkdir(config.FIXTURES_LLM_DIR, { recursive: true });
    await writeFile(
      join(config.FIXTURES_LLM_DIR, `${hash}.json`),
      JSON.stringify({ promptId: req.promptId, output: validated }, null, 2),
      'utf8',
    );
  }

  return validated;
}
