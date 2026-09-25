import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

export class ConversationStore {
  constructor({ rootDir = path.resolve('tmp/telegram'), ttlMs = 30 * 60 * 1000 } = {}) { this.rootDir = rootDir; this.ttlMs = ttlMs; this.items = new Map(); }
  key(userId) { return String(userId); }
  async start(userId) { if (this.items.has(this.key(userId))) throw new Error('A creation is already active'); const creationId = crypto.randomUUID(); const state = { creationId, telegramUserId: Number(userId), step: 'botName', data: {}, createdAt: Date.now() }; state.timer = setTimeout(() => this.cancel(userId), this.ttlMs).unref(); this.items.set(this.key(userId), state); return state; }
  get(userId) { const state = this.items.get(this.key(userId)); if (!state) return null; if (Date.now() - state.createdAt >= this.ttlMs) { this.cancel(userId); return null; } return state; }
  update(userId, patch) { const state = this.get(userId); if (!state) throw new Error('Creation expired'); Object.assign(state, patch); return state; }
  async tempDir(userId) { const state = this.get(userId); if (!state) throw new Error('Creation expired'); const dir = path.join(this.rootDir, String(userId), state.creationId); await fs.mkdir(dir, { recursive: true }); return dir; }
  async cancel(userId) { const state = this.items.get(this.key(userId)); if (!state) return false; clearTimeout(state.timer); await fs.rm(path.join(this.rootDir, String(userId), state.creationId), { recursive: true, force: true }); this.items.delete(this.key(userId)); return true; }
}
