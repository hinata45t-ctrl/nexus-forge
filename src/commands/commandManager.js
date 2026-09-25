export class CommandManager {
  constructor({ logger } = {}) { this.commands = new Map(); this.logger = logger; }
  register(command) { if (!command?.name || typeof command.execute !== 'function') throw new Error('Invalid command'); this.commands.set(command.name, command); for (const alias of command.aliases ?? []) this.commands.set(alias, command); }
  get(name) { return this.commands.get(name); }
  list() { return [...new Set(this.commands.values())]; }
  async execute(text, context) { const prefix = context.prefix; if (!text.startsWith(prefix)) return false; const [name, ...args] = text.slice(prefix.length).trim().split(/\s+/); const command = this.get(name?.toLowerCase()); if (!command) return false; await command.execute({ ...context, args, commandName: name }); return true; }
}
