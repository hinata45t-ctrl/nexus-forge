export function registerBuiltins(manager) {
  manager.register({ name: 'ping', description: 'Check bot status', async execute(ctx) { return ctx.reply?.(`Pong!\nInstance: ${ctx.instanceId}`); } });
  manager.register({ name: 'menu', description: 'Display the bot menu', async execute(ctx) { return ctx.reply?.(`${ctx.config.botName}\nOwner: ${ctx.config.ownerName}\nDeveloper: ${ctx.config.developerName}\nPrefix: ${ctx.prefix}`); } });
  manager.register({ name: 'owner', description: 'Display owner information', async execute(ctx) { return ctx.reply?.(`Owner: ${ctx.config.ownerName}\nNumber: ${ctx.config.ownerNumber}`); } });
  manager.register({ name: 'help', description: 'List available commands', async execute(ctx) { return ctx.reply?.(manager.list().map(command => `${ctx.prefix}${command.name} — ${command.description}`).join('\n')); } });
}
