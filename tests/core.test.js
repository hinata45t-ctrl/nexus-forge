import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createNexusForge } from '../src/core/instanceManager.js';
import { instancePaths } from '../src/storage/paths.js';

const valid = (overrides = {}) => ({ botName: 'Alpha', ownerName: 'Baki', ownerNumber: '22611111111', botPhoneNumber: '22622222222', developerName: 'Baki', prefix: '!', ...overrides });
async function setup() { return fs.mkdtemp(path.join(os.tmpdir(), 'nexus-forge-')); }

test('creates, reads, updates, and deletes an instance', async () => { const root = await setup(); const forge = createNexusForge({ storageRoot: root }); const result = await forge.createInstance(valid({ instanceId: 'nf_one' })); assert.equal(result.status, 'created'); assert.equal((await forge.getInstance('nf_one')).botName, 'Alpha'); await forge.updateInstance('nf_one', { botName: 'Renamed' }); assert.equal((await forge.getInstance('nf_one')).botName, 'Renamed'); await forge.deleteInstance('nf_one'); await assert.rejects(() => forge.getInstance('nf_one')); });
test('keeps two instances fully isolated', async () => { const root = await setup(); const forge = createNexusForge({ storageRoot: root }); await forge.createInstance(valid({ instanceId: 'nf_test_001', botName: 'Alpha', prefix: '!' })); await forge.createInstance(valid({ instanceId: 'nf_test_002', botName: 'Beta', ownerNumber: '22633333333', prefix: '#' })); assert.equal((await forge.getInstance('nf_test_001')).prefix, '!'); assert.equal((await forge.getInstance('nf_test_002')).prefix, '#'); assert.notEqual(instancePaths(root, 'nf_test_001').session, instancePaths(root, 'nf_test_002').session); });
test('validates configuration and exposes statuses', async () => { const root = await setup(); const forge = createNexusForge({ storageRoot: root }); assert.throws(() => forge.config?.validateConfig?.({}), /required/); await forge.createInstance(valid({ instanceId: 'nf_status' })); assert.equal(forge.getInstanceStatus('nf_status'), 'created'); });
test('executes commands with the instance prefix', async () => { const root = await setup(); const forge = createNexusForge({ storageRoot: root }); await forge.createInstance(valid({ instanceId: 'nf_cmd' })); const replies = []; await forge.commands.execute('!ping', { instanceId: 'nf_cmd', config: await forge.getInstance('nf_cmd'), prefix: '!', reply: value => replies.push(value) }); assert.match(replies[0], /Pong!/); assert.equal(await forge.commands.execute('#ping', { prefix: '!', config: valid(), reply() {} }), false); });
