export const DEFAULT_DANGEROUS_COMMANDS = new Set(['eval', 'exec', 'shutdown', 'restart', 'stop', 'restore', 'backup', 'maintenance', 'broadcast', 'kickall', 'kickallv2']);

export function canExecuteDangerousCommand(commandName, { allowDangerousCommands = false, isOwner = false } = {}) {
  if (!DEFAULT_DANGEROUS_COMMANDS.has(commandName)) return true;
  if (!allowDangerousCommands) return false;
  return Boolean(isOwner);
}
