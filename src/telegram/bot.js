import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

export function normalizePhone(value) {
  const number = String(value ?? '').trim().replace(/[\s().-]/g, '');
  if (!/^\+?[1-9]\d{6,14}$/.test(number)) throw new Error('Invalid phone number');
  return number.replace(/^\+/, '');
}

export function validPrefix(value) {
  return typeof value === 'string' && /^(?!.*\s).{1,3}$/.test(value);
}

export function adminIds(value = process.env.NEXUS_ADMIN_IDS ?? '') {
  return new Set(value.split(',').map(id => id.trim()).filter(Boolean));
}

export function isAdmin(id) {
  return adminIds().has(String(id));
}

export async function downloadTelegramPhoto(ctx, userId, store) {
  const photos = ctx.message?.photo;
  if (!photos?.length) throw new Error('Photo required');
  const photo = photos.at(-1);
  if (photo.file_size && photo.file_size > 10 * 1024 * 1024) throw new Error('Photo too large');
  const fileLink = await ctx.telegram.getFileLink(photo.file_id);
  const response = await fetch(fileLink.href);
  if (!response.ok) throw new Error('Photo download failed');
  const dir = await store.tempDir(userId);
  const file = path.join(dir, `${crypto.randomUUID()}.jpg`);
  await fs.writeFile(file, Buffer.from(await response.arrayBuffer()));
  return file;
}

export function publicStatus(status) {
  const map = {
    connected: '🟢 En ligne',
    starting: '🔵 Démarrage',
    waiting_pairing: '🟠 En attente du pairing',
    connecting: '🔵 Connexion',
    disconnected: '🔴 Déconnecté',
    stopped: '⚫ Arrêté',
    error: '🔴 Erreur',
    created: '🟡 Créé',
  };
  return map[status] ?? '⚪ Inconnu';
}
