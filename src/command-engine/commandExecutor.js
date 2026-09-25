import { parseCommand } from './commandParser.js';

export class CommandExecutor {
  constructor({ registry, permissionManager, logger, cooldowns = new Map() } = {}) {
    this.registry = registry;
    this.permissionManager = permissionManager;
    this.logger = logger;
    this.cooldowns = cooldowns;
  }

  getCooldownKey(instanceId, sender, commandName) {
    return `${instanceId}:${String(sender)}:${String(commandName)}`;
  }

  hasCooldown(instanceId, sender, commandName, ttlMs = 1500) {
    const key = this.getCooldownKey(instanceId, sender, commandName);
    const last = this.cooldowns.get(key);
    if (!last) return false;
    return Date.now() - last < ttlMs;
  }

  setCooldown(instanceId, sender, commandName, ttlMs = 1500) {
    const key = this.getCooldownKey(instanceId, sender, commandName);
    this.cooldowns.set(key, Date.now() + ttlMs);
  }

  async execute(input, ctx = {}) {
    const parsed = parseCommand(input, ctx.prefix ?? '!');
    if (!parsed || !parsed.command) return false;

    const command = this.registry.get(parsed.command);
    if (!command) {
      await ctx.reply?.('❌ Commande inconnue. Utilise !help pour voir les commandes disponibles.');
      return false;
    }

    const ownerCheck = this.permissionManager?.isOwner ? this.permissionManager.isOwner(ctx) : true;
    const executionContext = {
      ...ctx,
      command: parsed.command,
      args: parsed.args,
      rawArgs: parsed.rawArgs,
      prefix: parsed.prefix,
      isOwner: Boolean(ownerCheck || ctx.isOwner),
      isAdmin: Boolean(ctx.isAdmin),
      isGroup: Boolean(ctx.isGroup),
      chatId: ctx.chatId ?? ctx.chat,
    };

    if (!this.permissionManager?.canExecute(command, executionContext)) {
      await ctx.reply?.('❌ Tu n’as pas les permissions nécessaires.');
      return false;
    }

    if (this.hasCooldown(executionContext.instanceId, executionContext.sender, command.name)) {
      return false;
    }

    this.setCooldown(executionContext.instanceId, executionContext.sender, command.name);

    try {
      await command.execute(executionContext);
      return true;
    } catch (error) {
      this.logger?.error({ instanceId: executionContext.instanceId, sender: executionContext.sender, command: command.name, error: error.message }, 'Command execution failed');
      await ctx.reply?.('❌ Une erreur est survenue lors de l’exécution de cette commande.');
      return false;
    }
  }
}
