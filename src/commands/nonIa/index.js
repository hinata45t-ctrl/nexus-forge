import { NON_IA_COMMANDS } from './pack.js';

export function registerNonIaCommands(registry, logger) {
  for (const command of NON_IA_COMMANDS) {
    if (!registry.has(command.name)) {
      try {
        registry.register(command);
      } catch (error) {
        logger?.error({ command: command.name, error: error.message }, 'Failed to register non-IA command');
      }
    }
  }
}
