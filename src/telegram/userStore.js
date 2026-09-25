import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { instancePaths } from '../../storage/paths.js';

export class TelegramUserStore {
  constructor(rootDir = path.resolve('telegram-data')) { this.file = path.join(rootDir, 'users.json'); }
  async read() { try { return JSON.parse(await fs.readFile(this.file, 'utf8')); } catch { return {}; } }
  async write(data) { await fs.mkdir(path.dirname(this.file), { recursive: true }); const tmp = `${this.file}.${crypto.randomUUID()}.tmp`; await fs.writeFile(tmp, `${JSON.stringify(data, null, 2)}\n`); await fs.rename(tmp, this.file); }
  async getUser(id) { const data = await this.read(); return data[String(id)] ?? null; }
  async createUser(id) { const data = await this.read(); const key = String(id); if (!data[key]) data[key] = { telegramUserId: Number(id), instanceIds: [], createdAt: new Date().toISOString() }; await this.write(data); return data[key]; }
  async getUserInstances(id) { return (await this.getUser(id))?.instanceIds ?? []; }
  async addInstanceToUser(id, instanceId) { const data = await this.read(); const key = String(id); if (!data[key]) data[key] = { telegramUserId: Number(id), instanceIds: [] }; if (!data[key].instanceIds.includes(instanceId)) data[key].instanceIds.push(instanceId); await this.write(data); return data[key]; }
  async removeInstanceFromUser(id, instanceId) { const data = await this.read(); const key = String(id); if (data[key]) data[key].instanceIds = data[key].instanceIds.filter(value => value !== instanceId); await this.write(data); }
  async ownsInstance(id, instanceId) { return (await this.getUserInstances(id)).includes(instanceId); }
}
