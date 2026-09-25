import { createCommandEngine } from '../command-engine/index.js';
import { registerCoreCommands } from '../commands/core/register.js';
import { registerNonIaCommands } from '../commands/nonIa/index.js';

export function createWhatsAppCommandSystem({ logger } = {}) {
  const engine = createCommandEngine({ logger });
  registerCoreCommands(engine.registry, logger);
  registerNonIaCommands(engine.registry, logger);
  return engine;
}
