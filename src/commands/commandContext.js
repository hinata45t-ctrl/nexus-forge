export function createCommandContext({ instanceId, config, socket, message, sender, chat }) { return { instanceId, config, socket, message, sender, chat, prefix: config.prefix }; }
