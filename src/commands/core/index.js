import { createCommandEngine } from '../command-engine/index.js';
import { registerCoreCommands } from './register.js';
import { registerNonIaCommands } from '../nonIa/index.js';

export function createWhatsAppCommandSystem({ logger } = {}) {
  const engine = createCommandEngine({ logger });
  // The enhanced batch is loaded first; legacy definitions never overwrite it.
  registerNonIaCommands(engine.registry, logger);
  registerCoreCommands(engine.registry, logger);
  return engine;
}
