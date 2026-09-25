import { getNonIaCommands } from './pack.js';

export function registerBuiltins(manager) {
  const existingNames = new Set();
  for (const command of manager.commands.values()) existingNames.add(command.name);

  for (const command of getNonIaCommands()) {
    if (existingNames.has(command.name)) continue;
    manager.register(command);
  }
}
