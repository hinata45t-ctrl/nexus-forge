import 'dotenv/config';
import { createNexusForge } from './core/instanceManager.js';

export function createApp(options = {}) {
  return createNexusForge(options);
}

if (process.argv[1] && new URL(import.meta.url).pathname === process.argv[1]) {
  const forge = createApp();
  forge.logger.info('Nexus Forge core ready; waiting for instructions');
}
