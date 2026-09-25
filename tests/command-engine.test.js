import test from 'node:test';
import assert from 'node:assert/strict';
import { createWhatsAppCommandSystem } from '../src/command-engine/index.js';

test('parser works for different prefixes and commands', () => {
  const engine = createWhatsAppCommandSystem();
  assert.deepEqual(engine.loader.parse('!ping', '!'), { prefix: '!', command: 'ping', args: [], rawArgs: '' });
  assert.deepEqual(engine.loader.parse('.ping', '.'), { prefix: '.', command: 'ping', args: [], rawArgs: '' });
  assert.deepEqual(engine.loader.parse('#ping', '#'), { prefix: '#', command: 'ping', args: [], rawArgs: '' });
  const parsed = engine.loader.parse('!say Bonjour tout le monde', '!');
  assert.equal(parsed.command, 'say');
  assert.ok(parsed.args.length >= 3);
});

test('registry supports aliases and dynamic help', () => {
  const engine = createWhatsAppCommandSystem();
  assert.ok(engine.registry.get('ping'));
  assert.ok(engine.registry.get('p'));
  assert.equal(engine.registry.get('help').category, 'core');
});

test('permission manager and cooldown protect commands', async () => {
  const engine = createWhatsAppCommandSystem();
  let replyCount = 0;
  const ctx = { instanceId: 'nf_001', sender: '22611111111', prefix: '!', config: { ownerNumber: '22611111111' }, reply: async () => { replyCount += 1; } };
  const first = await engine.executor.execute('!ping', ctx);
  const second = await engine.executor.execute('!ping', ctx);
  assert.equal(first, true);
  assert.equal(second, false);
  assert.equal(replyCount, 1);
});

test('two instances remain isolated by prefix and owner', async () => {
  const engine = createWhatsAppCommandSystem();
  const aCtx = { instanceId: 'instance_a', sender: '22611111111', prefix: '!', config: { botName: 'BOT A', ownerName: 'OWNER A', ownerNumber: '22611111111', developerName: 'DEV A', prefix: '!' }, reply: async (msg) => msg };
  const bCtx = { instanceId: 'instance_b', sender: '22622222222', prefix: '.', config: { botName: 'BOT B', ownerName: 'OWNER B', ownerNumber: '22622222222', developerName: 'DEV B', prefix: '.' }, reply: async (msg) => msg };

  const aPing = await engine.executor.execute('!ping', aCtx);
  const bPing = await engine.executor.execute('.ping', bCtx);
  const wrongA = await engine.executor.execute('.ping', aCtx);
  const wrongB = await engine.executor.execute('!ping', bCtx);

  assert.equal(aPing, true);
  assert.equal(bPing, true);
  assert.equal(wrongA, false);
  assert.equal(wrongB, false);
});
