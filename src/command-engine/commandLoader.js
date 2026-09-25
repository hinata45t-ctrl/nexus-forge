import { parseCommand } from './commandParser.js';

export class CommandLoader {
  constructor({ registry, logger } = {}) {
    this.registry = registry;
    this.logger = logger;
  }

  load(commands) {
    for (const command of commands) {
      try {
        this.registry.register(command);
      } catch (error) {
        this.logger?.error({ error: error.message }, 'Failed to load command');
      }
    }
  }

  parse(input, prefix) {
    return parseCommand(input, prefix);
  }
}
