import 'dotenv/config';
import { createNexusForge } from './core/instanceManager.js';
import { createTelegramBot } from './telegram/bot.js';

export function createApp(options = {}) {
  const forge = createNexusForge(options);
  const telegram = options.telegram === false ? null : createTelegramBot({ forge, logger: forge.logger });
  return { forge, telegram };
}

if (process.argv[1] && new URL(import.meta.url).pathname === process.argv[1]) {
  const app = createApp();
  app.forge.logger.info('Nexus Forge core ready');

  if (app.telegram && typeof app.telegram.launch === 'function') {
    app.telegram.launch().then(() => app.forge.logger.info('NexusForgeManagerBot started')).catch(error => app.forge.logger.error(error, 'Telegram bot failed to start'));
  }
}
