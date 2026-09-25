import fs from 'node:fs/promises';
import path from 'node:path';
import { validTimeZone } from './timezone.js';

export class InstanceConfig {
  constructor(store) { this.store = store; }
  async getConfig(id) { return this.store.get(id); }
  async updateConfig(id, updates) { return this.store.update(id, this.validateConfig({ ...(await this.getConfig(id)), ...updates, instanceId: id })); }
  validateConfig(config) {
    const required = ['botName', 'ownerName', 'ownerNumber', 'developerName', 'prefix'];
    for (const key of required) if (typeof config[key] !== 'string' || !config[key].trim()) throw new Error(`${key} is required`);
    if (config.botName.length > 80 || config.ownerName.length > 80 || config.developerName.length > 80) throw new Error('Name is too long');
    for (const key of ['ownerNumber', 'botPhoneNumber']) if (config[key] && !/^\+?[1-9]\d{6,14}$/.test(config[key])) throw new Error(`Invalid ${key}`);
    if (!/^(?!.*\s).{1,3}$/.test(config.prefix)) throw new Error('prefix must be 1 to 3 non-space characters');
    if (config.mode && !['public', 'private'].includes(config.mode)) throw new Error('mode must be public or private');
    if (config.timezone && !validTimeZone(config.timezone)) throw new Error('Invalid timezone');
    return { mode: 'public', timezone: 'UTC', status: 'created', ...config };
  }
  async setMenuImage(id, imagePath) { await fs.access(imagePath); return this.updateConfig(id, { menuImage: imagePath }); }
  async getMenuImage(id) { const config = await this.getConfig(id); const custom = config.menuImage && path.resolve(this.store.paths(id).assets, config.menuImage); try { if (custom) await fs.access(custom); return custom; } catch {} return path.resolve('assets/default-menu.jpg'); }
}
