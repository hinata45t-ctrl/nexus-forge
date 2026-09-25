export async function handleWhatsAppMessage({ instanceId, socket, message, manager, logger }) {
  const config = await manager.store.get(instanceId);
  if (!config) return;

  const remoteJid = message.key?.remoteJid;
  const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
  const prefix = config.prefix ?? '!';

  if (!text || !text.startsWith(prefix)) return;

  const [commandName, ...args] = text.slice(prefix.length).trim().split(/\s+/);
  const sender = message.key?.participant || remoteJid;
  const chat = remoteJid;

  const context = {
    instanceId,
    config,
    socket,
    message,
    sender,
    chat,
    prefix,
    args,
    commandName,
    reply: async (payload) => {
      if (!remoteJid) return null;
      return socket.sendMessage(remoteJid, { text: payload });
    },
  };

  if (!manager.commandManager) {
    logger.warn({ instanceId }, 'No command manager registered for this WhatsApp instance');
    return;
  }

  await manager.commandManager.execute(text, context);
}
