import { CommandRegistry } from './commandRegistry.js';
import { CommandLoader } from './commandLoader.js';
import { CommandExecutor } from './commandExecutor.js';
import { PermissionManager } from './permissionManager.js';

export function createCommandEngine({ logger } = {}) {
  const registry = new CommandRegistry();
  const permissionManager = new PermissionManager();
  const loader = new CommandLoader({ registry, logger });
  const executor = new CommandExecutor({ registry, permissionManager, logger });

  return { registry, loader, executor, permissionManager };
}
