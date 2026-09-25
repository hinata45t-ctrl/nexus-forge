import { createCommandEngine } from '../command-engine/index.js';
import { registerCoreCommands } from './register.js';

export function createWhatsAppCommandSystem({ logger } = {}) {
  const engine = createCommandEngine({ logger });
  registerCoreCommands(engine.registry, logger);
  return engine;
}
