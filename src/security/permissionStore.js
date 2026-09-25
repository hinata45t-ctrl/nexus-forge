import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { normalizeUserId, sanitizeLogData } from './permissions.js';

export class PermissionStore {
  constructor(rootDir = path.resolve('permissions')) {
    this.rootDir = rootDir;
  }

  getInstanceDir(instanceId) {
    return path.join(this.rootDir, String(instanceId));
  }

  async ensure(instanceId) {
    const dir = this.getInstanceDir(instanceId);
    await fs.mkdir(dir, { recursive: true });
    return dir;
  }

  async readJson(file) {
    try {
      return JSON.parse(await fs.readFile(file, 'utf8'));
    } catch {
      return {};
    }
  }

  async writeJson(file, value) {
    await fs.mkdir(path.dirname(file), { recursive: true });
    const tmp = `${file}.${crypto.randomUUID()}.tmp`;
    await fs.writeFile(tmp, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
    await fs.rename(tmp, file);
  }

  async getOwner(instanceId) {
    const file = path.join(this.getInstanceDir(instanceId), 'owner.json');
    const data = await this.readJson(file);
    return data.owner ?? null;
  }

  async setOwner(instanceId, userId) {
    const file = path.join(this.getInstanceDir(instanceId), 'owner.json');
    await this.writeJson(file, { owner: normalizeUserId(userId) });
    return normalizeUserId(userId);
  }

  async getSudoUsers(instanceId) {
    const file = path.join(this.getInstanceDir(instanceId), 'sudo.json');
    const data = await this.readJson(file);
    return (Array.isArray(data.sudoUsers) ? data.sudoUsers : []).map(normalizeUserId).filter(Boolean);
  }

  async setSudoUsers(instanceId, users) {
    const file = path.join(this.getInstanceDir(instanceId), 'sudo.json');
    const normalized = [...new Set((users ?? []).map(normalizeUserId).filter(Boolean))];
    await this.writeJson(file, { sudoUsers: normalized });
    return normalized;
  }

  async addSudoUser(instanceId, userId) {
    const sudoUsers = await this.getSudoUsers(instanceId);
    const next = [...new Set([...sudoUsers, normalizeUserId(userId)])].filter(Boolean);
    await this.setSudoUsers(instanceId, next);
    return next;
  }

  async removeSudoUser(instanceId, userId) {
    const sudoUsers = await this.getSudoUsers(instanceId);
    const next = sudoUsers.filter(item => item !== normalizeUserId(userId));
    await this.setSudoUsers(instanceId, next);
    return next;
  }

  async getMaintenanceMode(instanceId) {
    const file = path.join(this.getInstanceDir(instanceId), 'maintenance.json');
    const data = await this.readJson(file);
    return Boolean(data.enabled);
  }

  async setMaintenanceMode(instanceId, enabled) {
    const file = path.join(this.getInstanceDir(instanceId), 'maintenance.json');
    await this.writeJson(file, { enabled: Boolean(enabled) });
    return Boolean(enabled);
  }

  async getPremiumUsers(instanceId) {
    const file = path.join(this.getInstanceDir(instanceId), 'premium.json');
    const data = await this.readJson(file);
    return data.users || {};
  }

  async setPremiumUser(instanceId, userId, premium = true, until = null) {
    const file = path.join(this.getInstanceDir(instanceId), 'premium.json');
    const current = await this.getPremiumUsers(instanceId);
    current[normalizeUserId(userId)] = { premium: Boolean(premium), premiumSince: new Date().toISOString(), premiumUntil: until ?? null };
    await this.writeJson(file, { users: current });
    return current[normalizeUserId(userId)];
  }

  async isPremium(instanceId, userId) {
    const users = await this.getPremiumUsers(instanceId);
    const key = normalizeUserId(userId);
    const data = users[key];
    if (!data?.premium) return false;
    if (!data.premiumUntil) return true;
    return new Date(data.premiumUntil).getTime() > Date.now();
  }
}
