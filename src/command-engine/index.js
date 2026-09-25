import { CommandRegistry } from './commandRegistry.js';
import { CommandLoader } from './commandLoader.js';
import { CommandExecutor } from './commandExecutor.js';
import { PermissionManager } from './permissionManager.js';

export function createCommandEngine({ logger, registry, permissionManager, loader } = {}) {
  const commandRegistry = registry ?? new CommandRegistry();
  const permission = permissionManager ?? new PermissionManager();
  const executor = new CommandExecutor({
    registry: commandRegistry,
    permissionManager: permission,
    logger,
  });
  const commandLoader = loader ?? new CommandLoader({
    registry: commandRegistry,
    logger,
  });

  return {
    registry: commandRegistry,
    loader: commandLoader,
    executor,
    permissionManager: permission,
  };
}

export { CommandRegistry, CommandLoader, CommandExecutor, PermissionManager };
