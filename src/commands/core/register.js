export function registerCoreCommands(registry, logger) {
  const commands = [
    {
      name: 'ping',
      aliases: ['p'],
      description: 'Vérifie que le bot fonctionne',
      usage: '!ping',
      category: 'core',
      execute: async (ctx) => {
        const startedAt = Date.now();
        const now = Date.now();
        const latency = Math.max(0, now - startedAt);
        return ctx.reply?.(`🏓 Pong!\n⚡ ${latency} ms`);
      },
    },
    {
      name: 'menu',
      aliases: ['m'],
      description: 'Affiche le menu de l’instance',
      usage: '!menu',
      category: 'core',
      execute: async (ctx) => {
        const config = ctx.config ?? {};
        return ctx.reply?.(`╭━━〔 ${config.botName ?? 'Nexus Forge'} 〕━━╮\n\n👤 Owner : ${config.ownerName ?? 'N/A'}\n👨‍💻 Dev : ${config.developerName ?? 'N/A'}\n🔧 Prefix : ${ctx.prefix ?? '!'}\n📊 Status : ${ctx.status ?? 'ONLINE'}\n\n━━━━━━━━━━━━━━━━\n!ping\n!owner\n!help\n\n╰━━━━━━━━━━━━━━━━━━╯`);
      },
    },
    {
      name: 'owner',
      aliases: ['o'],
      description: 'Affiche l’owner de l’instance',
      usage: '!owner',
      category: 'core',
      execute: async (ctx) => {
        const config = ctx.config ?? {};
        return ctx.reply?.(`╭━━〔 OWNER 〕━━╮\n\n👤 Nom : ${config.ownerName ?? 'N/A'}\n📱 Numéro : +${config.ownerNumber ?? 'N/A'}\n\n╰━━━━━━━━━━━━━━╯`);
      },
    },
    {
      name: 'help',
      aliases: ['h'],
      description: 'Affiche les commandes disponibles',
      usage: '!help',
      category: 'core',
      execute: async (ctx) => {
        const commands = [...registry.getAll()].filter(command => command.category === 'core');
        const lines = commands.map(command => `${ctx.prefix}${command.name}`).join('\n');
        return ctx.reply?.(`╭━━〔 COMMANDES 〕━━╮\n\n🏠 CORE\n${lines}\n\n╰━━━━━━━━━━━━━━━━━╯`);
      },
    },
    {
      name: 'info',
      aliases: ['i'],
      description: 'Affiche les informations du bot',
      usage: '!info',
      category: 'core',
      execute: async (ctx) => {
        const config = ctx.config ?? {};
        return ctx.reply?.(`╭━━〔 BOT INFO 〕━━╮\n\n🤖 Nom : ${config.botName ?? 'Nexus Forge'}\n🆔 ID : ${ctx.instanceId ?? 'N/A'}\n👨‍💻 Dev : ${config.developerName ?? 'N/A'}\n🔧 Prefix : ${ctx.prefix ?? '!'}\n🟢 Status : ${ctx.status ?? 'ONLINE'}\n\n╰━━━━━━━━━━━━━━╯`);
      },
    },
  ];

  for (const command of commands) {
    try { registry.register(command); } catch (error) { logger?.error({ error: error.message }, 'Failed to register core command'); }
  }
}
