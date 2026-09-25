import fs from 'node:fs/promises';
import path from 'node:path';
import { normalizeUserId } from './permissions.js';

export async function createOwnerSudoStore(baseDir = path.resolve('instance-security')) {
  await fs.mkdir(baseDir, { recursive: true });
  return {
    async getOwner(instanceId) {
      const file = path.join(baseDir, String(instanceId), 'owner.json');
      try { const json = JSON.parse(await fs.readFile(file, 'utf8')); return normalizeUserId(json.owner); } catch { return null; }
    },
    async setOwner(instanceId, userId) {
      const file = path.join(baseDir, String(instanceId), 'owner.json');
      await fs.mkdir(path.dirname(file), { recursive: true });
      await fs.writeFile(file, JSON.stringify({ owner: normalizeUserId(userId) }, null, 2));
      return normalizeUserId(userId);
    },
    async getSudoUsers(instanceId) {
      const file = path.join(baseDir, String(instanceId), 'sudo.json');
      try { const json = JSON.parse(await fs.readFile(file, 'utf8')); return (json.sudoUsers ?? []).map(normalizeUserId); } catch { return []; }
    },
    async setSudoUsers(instanceId, users) {
      const file = path.join(baseDir, String(instanceId), 'sudo.json');
      await fs.mkdir(path.dirname(file), { recursive: true });
      const normalized = [...new Set((users ?? []).map(normalizeUserId).filter(Boolean))];
      await fs.writeFile(file, JSON.stringify({ sudoUsers: normalized }, null, 2));
      return normalized;
    },
  };
}
