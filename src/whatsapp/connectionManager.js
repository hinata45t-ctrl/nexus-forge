import makeWASocket, { DisconnectReason, useMultiFileAuthState, Browsers } from '@whiskeysockets/baileys';
import { SessionManager } from './sessionManager.js';
import { handleWhatsAppMessage } from './eventHandler.js';

function normalizePhone(input) {
  const value = String(input ?? '').trim().replace(/[\s().-]/g, '');
  if (!/^\+?[1-9]\d{6,14}$/.test(value)) throw new Error('Invalid phone number');
  return value.startsWith('+') ? value.slice(1) : value;
}

export class WhatsAppManager {
  constructor({ store, runtime, logger }) {
    this.store = store;
    this.runtime = runtime;
    this.logger = logger;
    this.sessions = new SessionManager(store.rootDir);
    this.sockets = new Map();
    this.reconnectAttempts = new Map();
    this.commandManager = null;
  }

  setCommandManager(commandManager) {
    this.commandManager = commandManager;
  }

  async connect(id) {
    const config = await this.store.get(id);
    if (this.sockets.has(id)) return this.sockets.get(id);

    this.runtime.set(id, 'starting');
    const { state, saveCreds } = await useMultiFileAuthState(this.sessions.getSessionPath(id));
    const socket = makeWASocket({
      auth: state,
      printQRInTerminal: false,
      browser: Browsers.ubuntu('Nexus Forge'),
      syncFullHistory: false,
    });

    this.sockets.set(id, socket);
    this.runtime.set(id, 'connecting');

    socket.ev.on('creds.update', saveCreds);
    socket.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        this.runtime.set(id, 'waiting_pairing');
        this.logger.info({ instanceId: id }, 'WhatsApp pairing QR available');
      }

      if (connection === 'open') {
        this.runtime.set(id, 'connected');
        this.reconnectAttempts.delete(id);
        this.logger.info({ instanceId: id }, 'WhatsApp connected');
      }

      if (connection === 'close') {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

        this.sockets.delete(id);

        if (statusCode === DisconnectReason.loggedOut) {
          this.runtime.set(id, 'stopped');
          this.logger.warn({ instanceId: id }, 'WhatsApp session logged out');
        } else {
          this.runtime.set(id, 'disconnected');
          this.logger.warn({ instanceId: id, statusCode }, 'WhatsApp disconnected');
          if (shouldReconnect) {
            const attempt = this.reconnectAttempts.get(id) ?? 0;
            const nextDelay = Math.min(60000, 5000 * 2 ** attempt);
            this.reconnectAttempts.set(id, attempt + 1);
            setTimeout(() => this.connect(id).catch(error => this.logger.error({ instanceId: id, error: error.message }, 'Reconnect failed')), nextDelay);
          }
        }
      }
    });

    socket.ev.on('messages.upsert', async (event) => {
      const message = event.messages?.[0];
      if (!message || message.key?.fromMe || !message.message) return;
      await handleWhatsAppMessage({ instanceId: id, socket, message, manager: this, logger: this.logger });
    });

    return socket;
  }

  async disconnect(id) {
    const socket = this.sockets.get(id);
    if (socket) {
      await socket.end(undefined);
      this.sockets.delete(id);
    }
    this.runtime.set(id, 'stopped');
    this.logger.info({ instanceId: id }, 'WhatsApp disconnected');
    return true;
  }

  async restart(id) {
    await this.disconnect(id);
    return this.connect(id);
  }

  getSocket(id) {
    return this.sockets.get(id);
  }

  getStatus(id) {
    return this.runtime.get(id) ?? 'created';
  }

  getAllConnections() {
    return new Map(this.sockets);
  }

  async requestPairingCode(id, phoneNumber) {
    const config = await this.store.get(id);
    const normalized = normalizePhone(phoneNumber ?? config.botPhoneNumber ?? config.ownerNumber);

    if (!config || !config.instanceId) {
      throw new Error('Instance not found');
    }

    if (!config.botPhoneNumber && !phoneNumber) {
      throw new Error('botPhoneNumber is required');
    }

    const socket = this.sockets.get(id) ?? await this.connect(id);
    this.runtime.set(id, 'waiting_pairing');

    if (socket.user?.id) {
      this.runtime.set(id, 'connected');
      return null;
    }

    const code = await socket.requestPairingCode(normalized);
    this.logger.info({ instanceId: id }, 'Pairing code generated');
    return code;
  }

  async restoreInstances() {
    const entries = await this.store.list();
    return entries.map(entry => entry.instanceId ?? entry);
  }
}
