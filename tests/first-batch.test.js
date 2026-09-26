import test from 'node:test';
import assert from 'node:assert/strict';
import { createWhatsAppCommandSystem } from '../src/commands/core/index.js';

test('first batch provides real implementations for the first 20 commands', async () => {
  const engine = createWhatsAppCommandSystem();
  assert.equal(engine.registry.get('ping').category, 'core');
  assert.ok(engine.registry.get('calc'));
  assert.ok(engine.registry.get('quote'));
  const replies = [];
  const ctx = { instanceId: 'batch-1', sender: '123', prefix: '!', config: { botName: 'Test', ownerName: 'Owner', developerName: 'Dev', prefix: '!' }, registry: engine.registry, args: ['2*(3+4)'], rawArgs: '2*(3+4)', reply: async value => replies.push(value) };
  assert.equal(await engine.executor.execute('!calc 2*(3+4)', ctx), true);
  assert.match(replies.at(-1), /14/);
  assert.equal(await engine.executor.execute('!url ftp://example.com', { ...ctx, args: ['ftp://example.com'], rawArgs: 'ftp://example.com' }), false);
});

test('configured external services are required instead of pretending success', async () => {
  const engine = createWhatsAppCommandSystem();
  const replies = [];
  const ctx = { instanceId: 'batch-2', sender: '123', prefix: '!', config: {}, args: ['Paris'], rawArgs: 'Paris', reply: async value => replies.push(value) };
  assert.equal(await engine.executor.execute('!weather Paris', ctx), false);
  assert.match(replies.at(-1), /service weather/i);
});
