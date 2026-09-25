import test from 'node:test';
import assert from 'node:assert/strict';
import { createWhatsAppCommandSystem } from '../src/command-engine/index.js';

test('non-IA registry includes the expected commands', () => {
  const engine = createWhatsAppCommandSystem();
  assert.ok(engine.registry.get('weather'));
  assert.ok(engine.registry.get('coinflip'));
  assert.ok(engine.registry.get('warn'));
  assert.ok(engine.registry.get('shutdown'));
  assert.ok(engine.registry.get('tgs'));
});

test('owner-only and group-only permissions are enforced', async () => {
  const engine = createWhatsAppCommandSystem();
  const ownerCtx = { instanceId: 'nf_001', sender: '22611111111', prefix: '!', config: { ownerNumber: '22611111111' }, isOwner: true, isAdmin: false, isGroup: false, reply: async () => 'ok' };
  const memberCtx = { instanceId: 'nf_001', sender: '22622222222', prefix: '!', config: { ownerNumber: '22611111111' }, isOwner: false, isAdmin: false, isGroup: false, reply: async () => 'ok' };

  const ownerOk = await engine.executor.execute('!shutdown', ownerCtx);
  const memberDenied = await engine.executor.execute('!shutdown', memberCtx);

  assert.equal(ownerOk, true);
  assert.equal(memberDenied, false);
});

test('instance isolation still works for the new command pack', async () => {
  const engine = createWhatsAppCommandSystem();
  const aCtx = { instanceId: 'instance_a', sender: '22611111111', prefix: '!', config: { ownerNumber: '22611111111', botName: 'BOT A' }, isOwner: true, isAdmin: false, isGroup: false, reply: async msg => msg };
  const bCtx = { instanceId: 'instance_b', sender: '22622222222', prefix: '.', config: { ownerNumber: '22622222222', botName: 'BOT B' }, isOwner: true, isAdmin: false, isGroup: false, reply: async msg => msg };

  assert.equal(await engine.executor.execute('!ping', aCtx), true);
  assert.equal(await engine.executor.execute('.ping', bCtx), true);
  assert.equal(await engine.executor.execute('.ping', aCtx), false);
  assert.equal(await engine.executor.execute('!ping', bCtx), false);
});
