import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  HOST: z.string().default('0.0.0.0'),

  RENAISSANCE_MODE: z.enum(['live', 'replay', 'record']).optional(),
  RENAISSANCE_STORE: z.enum(['file', 'pg']).default('file'),

  SERPAPI_API_KEY: z.string().optional(),
  OPENROUTER_API_KEY: z.string().optional(),
  OPENROUTER_MODEL: z.string().default('deepseek/deepseek-chat'),
  DATABASE_URL: z.string().optional(),

  PUBLIC_DEMO_MODE: z
    .string()
    .optional()
    .transform((v) => v === 'true' || v === '1'),
  ACCESS_CODE: z.string().optional(),

  DAILY_CREDIT_CAP: z.coerce.number().int().nonnegative().default(50),
  SERPAPI_MONTHLY_HARD_CAP: z.coerce.number().int().positive().default(240),
  PER_BRIEF_CREDIT_CAP: z.coerce.number().int().positive().default(8),

  CORS_ORIGINS: z.string().optional(),
  RETENTION_DAYS: z.coerce.number().int().positive().default(31),

  FIXTURES_REPLAY_DIR: z.string().default('fixtures/replay'),
  FIXTURES_LLM_DIR: z.string().default('fixtures/llm'),

  OWNER_COOKIE_NAME: z.string().default('renaissance_owner'),
  FILING_CUTOFF_YEAR: z.coerce.number().int().default(2005),
});

export type AppConfig = z.infer<typeof envSchema> & {
  mode: 'live' | 'replay' | 'record';
  serpapiEnabled: boolean;
};

function resolveMode(parsed: z.infer<typeof envSchema>): 'live' | 'replay' | 'record' {
  if (parsed.RENAISSANCE_MODE) return parsed.RENAISSANCE_MODE;
  if (parsed.SERPAPI_API_KEY && parsed.SERPAPI_API_KEY.length > 0) return 'live';
  return 'replay';
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const parsed = envSchema.parse(env);
  const mode = resolveMode(parsed);
  const serpapiEnabled = mode === 'live' && Boolean(parsed.SERPAPI_API_KEY);

  if (parsed.PUBLIC_DEMO_MODE && mode === 'live' && !parsed.ACCESS_CODE) {
    throw new Error('ACCESS_CODE is required when PUBLIC_DEMO_MODE=true in live mode');
  }

  return {
    ...parsed,
    mode,
    serpapiEnabled,
  };
}

let cached: AppConfig | null = null;

export function getConfig(): AppConfig {
  if (!cached) cached = loadConfig();
  return cached;
}

export function resetConfigForTests(): void {
  cached = null;
}
