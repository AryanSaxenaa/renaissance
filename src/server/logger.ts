import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  redact: {
    paths: [
      'api_key',
      'apiKey',
      'authorization',
      'req.headers.authorization',
      'req.headers.cookie',
      'headers.authorization',
      'headers.cookie',
      'SERPAPI_API_KEY',
      'OPENROUTER_API_KEY',
    ],
    censor: '[REDACTED]',
  },
});

export type Logger = typeof logger;
