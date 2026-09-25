import test from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs/promises';
import { TelegramUserStore } from '../src/telegram/userStore.js';
import { ConversationStore } from '../src/telegram/conversationStore.js';
import { normalizePhone, validPrefix } from '../src/telegram/telegramUtils.js';

test('Telegram users and ownership are isolated', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'nf-users-'));
  const users = new TelegramUserStore(root);

  await users.createUser(111111111);
  await users.createUser(222222222);
  await users.addInstanceToUser(111111111, 'nf_A');
  await users.addInstanceToUser(222222222, 'nf_B');

  assert.equal(await users.ownsInstance(111111111, 'nf_A'), true);
  assert.equal(await users.ownsInstance(111111111, 'nf_B'), false);
  assert.equal(await users.ownsInstance(222222222, 'nf_B'), true);
});

test('creation conversations are independent and cancellable', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'nf-conversations-'));
  const conversations = new ConversationStore({ rootDir: root, ttlMs: 100 });

  const a = await conversations.start(111111111);
  const b = await conversations.start(222222222);

  assert.notEqual(a.creationId, b.creationId);
  conversations.update(111111111, { step: 'photo' });
  assert.equal(conversations.get(111111111).step, 'photo');

  await conversations.cancel(111111111);
  assert.equal(conversations.get(111111111), null);

  await new Promise(resolve => setTimeout(resolve, 130));
  assert.equal(conversations.get(222222222).step, 'botName');
});

test('Telegram input validation normalizes numbers and prefixes', () => {
  assert.equal(normalizePhone('+226 11-11-1111'), '22611111111');
  assert.equal(validPrefix('!'), true);
  assert.equal(validPrefix('bad prefix'), false);
  assert.throws(() => normalizePhone('not-a-phone'));
});
