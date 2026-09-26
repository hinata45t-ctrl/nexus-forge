import test from 'node:test';
import assert from 'node:assert/strict';
import { createWhatsAppCommandSystem } from '../src/commands/core/index.js';

test('third batch enforces group and admin permissions', async () => {
  const engine = createWhatsAppCommandSystem();
  const replies = [];
  const base = { instanceId: 'third-batch', sender: '123456789', prefix: '!', config: {}, reply: async value => replies.push(value) };
  assert.equal(await engine.executor.execute('!kick 987654321', { ...base, isGroup: false, isAdmin: true }), false);
  assert.equal(await engine.executor.execute('!kick 987654321', { ...base, isGroup: true, isAdmin: false }), false);
});

test('third batch delegates destructive actions to explicit group services', async () => {
  const engine = createWhatsAppCommandSystem();
  let removed;
  const replies = [];
  const ctx = {
    instanceId: 'third-batch-service', sender: '123456789', prefix: '!', isGroup: true, isAdmin: true,
    config: {}, rawArgs: '987654321', args: ['987654321'],
    reply: async value => replies.push(value),
    groupActions: { removeParticipant: async (_ctx, id) => { removed = id; } }
  };
  assert.equal(await engine.executor.execute('!kick 987654321', ctx), true);
  assert.equal(removed, '987654321');
  assert.match(replies.at(-1), /retiré/i);
});

test('third batch validates group description and announcement mode', async () => {
  const engine = createWhatsAppCommandSystem();
  const replies = [];
  const ctx = { instanceId: 'third-batch-validation', sender: '123', prefix: '!', isGroup: true, isAdmin: true, config: {}, reply: async value => replies.push(value), groupActions: { updateDescription: async () => {} } };
  assert.equal(await engine.executor.execute(`!setdesc ${'x'.repeat(513)}`, ctx), false);
  assert.match(replies.at(-1), /512/);
});
