export function parseCommand(input, prefix = '!') {
  if (!input || typeof input !== 'string') return null;
  const trimmed = input.trim();
  if (!trimmed.startsWith(prefix)) return null;

  const raw = trimmed.slice(prefix.length).trim();
  if (!raw) return { prefix, command: '', args: [], rawArgs: '' };

  const match = raw.match(/^([A-Za-z0-9_-]+)(?:\s+(.*))?$/s);
  if (!match) {
    const command = raw.split(/\s+/)[0];
    const rest = raw.slice(command.length).trim();
    return { prefix, command: command.toLowerCase(), args: rest ? rest.split(/\s+/) : [], rawArgs: rest ?? '' };
  }

  const [, command, rest = ''] = match;
  return {
    prefix,
    command: command.toLowerCase(),
    args: rest ? rest.match(/"([^"]*)"|'([^']*)'|(\S+)/g)?.map(part => part.replace(/^['"]|['"]$/g, '')) ?? [] : [],
    rawArgs: rest,
  };
}
