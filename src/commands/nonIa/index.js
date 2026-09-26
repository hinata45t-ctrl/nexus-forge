import { FIRST_BATCH_COMMANDS } from './firstBatch.js';
import { NON_IA_COMMANDS } from './pack.js';

export function registerNonIaCommands(registry, logger) {
  for (const command of [...FIRST_BATCH_COMMANDS, ...NON_IA_COMMANDS]) {
    if (registry.has(command.name)) continue;
    try { registry.register(command); } catch (error) { logger?.error({ command: command.name, error: error.message }, 'Failed to register non-IA command'); }
  }
}

export { FIRST_BATCH_COMMANDS };
