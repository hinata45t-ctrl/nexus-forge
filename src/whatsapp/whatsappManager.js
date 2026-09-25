import makeWASocket, { DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys';
import { SessionManager } from './sessionManager.js';
export class WhatsAppManager {
  constructor({ store, runtime, logger }) { this.store = store; this.runtime = runtime; this.logger = logger; this.sessions = new SessionManager(store.rootDir); this.sockets = new Map(); }
  async connect(id) {
    const config = await this.store.get(id); if (this.sockets.has(id)) return this.sockets.get(id);
    this.runtime.set(id, 'starting');
    const { state, saveCreds } = await useMultiFileAuthState(this.sessions.getSessionPath(id));
    const socket = makeWASocket({ auth: state, printQRInTerminal: false, browser: ['Nexus Forge', 'Linux', '1.0.0'] });
    this.sockets.set(id, socket); this.runtime.set(id, 'connecting');
    socket.ev.on('creds.update', saveCreds);
    socket.ev.on('connection.update', ({ connection, lastDisconnect }) => {
      if (connection === 'open') this.runtime.set(id, 'connected');
      if (connection === 'close') { this.sockets.delete(id); const code = lastDisconnect?.error?.output?.statusCode; this.runtime.set(id, code === DisconnectReason.loggedOut ? 'stopped' : 'disconnected'); }
    });
    return socket;
  }
  async disconnect(id) { const socket = this.sockets.get(id); if (socket) { socket.end(undefined); this.sockets.delete(id); } this.runtime.set(id, 'stopped'); }
  async restart(id) { await this.disconnect(id); return this.connect(id); }
  getSocket(id) { return this.sockets.get(id); }
  getStatus(id) { return this.runtime.get(id) ?? 'created'; }
  getAllConnections() { return new Map(this.sockets); }
  async requestPairingCode(id, phoneNumber) { if (!/^\+?[1-9]\d{6,14}$/.test(phoneNumber)) throw new Error('Invalid phone number'); const socket = this.sockets.get(id) ?? await this.connect(id); this.runtime.set(id, 'waiting_pairing'); return socket.requestPairingCode(phoneNumber.replace(/\D/g, '')); }
}
