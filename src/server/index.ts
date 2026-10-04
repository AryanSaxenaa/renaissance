import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();
import { createApp } from './app.js';
import { getConfig } from './config.js';
import { logger } from './logger.js';
import { getStore } from './store/index.js';

async function main(): Promise<void> {
  const config = getConfig();
  await getStore();
  const app = createApp();
  app.listen(config.PORT, config.HOST, () => {
    logger.info({ port: config.PORT, mode: config.mode, host: config.HOST }, 'renaissance_server_started');
  });
}

main().catch((err) => {
  logger.fatal({ err: String(err) }, 'boot_failed');
  process.exit(1);
});
