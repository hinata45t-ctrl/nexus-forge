export class CommandRegistry {
  constructor() {
    this.commands = new Map();
    this.categories = new Map();
    this.aliases = new Map();
  }

  register(command) {
    if (!command || typeof command !== 'object') throw new Error('Command must be an object');
    if (!command.name || typeof command.name !== 'string') throw new Error('Command name is required');
    if (typeof command.execute !== 'function') throw new Error(`Command ${command.name} must define execute()`);
    if (!command.description || typeof command.description !== 'string') throw new Error(`Command ${command.name} must define description`);
    if (!command.category || typeof command.category !== 'string') throw new Error(`Command ${command.name} must define category`);

    const name = command.name.toLowerCase();
    if (this.commands.has(name)) throw new Error(`Duplicate command name: ${name}`);

    const aliases = command.aliases ?? [];
    for (const alias of aliases) {
      const normalized = alias.toLowerCase();
      if (this.commands.has(normalized) || this.aliases.has(normalized)) {
        throw new Error(`Duplicate command alias: ${normalized}`);
      }
      this.aliases.set(normalized, name);
    }

    this.commands.set(name, command);
    if (!this.categories.has(command.category)) this.categories.set(command.category, new Map());
    this.categories.get(command.category).set(name, command);
    return command;
  }

  get(name) {
    const key = String(name ?? '').toLowerCase();
    const match = this.commands.get(key) ?? this.commands.get(this.aliases.get(key));
    return match ?? null;
  }

  has(name) {
    return Boolean(this.get(name));
  }

  getAll() {
    return [...this.commands.values()];
  }

  getByCategory(category) {
    return [...(this.categories.get(category)?.values() ?? [])];
  }
}
