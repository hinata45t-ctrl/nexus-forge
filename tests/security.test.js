import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeUserId, sanitizeLogData } from '../src/security/permissions.js';
import { AppSecurity } from '../src/security/securityManager.js';

test('normalizeUserId strips WhatsApp format variations', () => {
  assert.equal(normalizeUserId('+22611111111'), '22611111111');
  assert.equal(normalizeUserId('22611111111'), '22611111111');
  assert.equal(normalizeUserId('@22611111111'), '22611111111');
});

test('sanitizeLogData redacts sensitive fields', () => {
  const data = { token: 'abc123', apiKey: 'secret', ok: true };
  const sanitized = sanitizeLogData(data);
  assert.equal(sanitized.token, '[REDACTED]');
  assert.equal(sanitized.apiKey, '[REDACTED]');
});

test('owner and sudo are isolated per instance', async () => {
  const app = new AppSecurity();
  await app.setOwner('instance_a', '22611111111');
  await app.setOwner('instance_b', '22622222222');
  await app.addSudo('instance_a', '22633333333');

  assert.equal(await app.isOwner('instance_a', '22611111111'), true);
  assert.equal(await app.isOwner('instance_b', '22611111111'), false);
  assert.equal(await app.isSudo('instance_a', '22633333333'), true);
  assert.equal(await app.isSudo('instance_b', '22633333333'), false);
});

test('dangerous command protections are enforced', () => {
  assert.equal(canExecuteDangerousCommand('eval', { allowDangerousCommands: false, isOwner: true }), false);
  assert.equal(canExecuteDangerousCommand('restart', { allowDangerousCommands: true, isOwner: true }), true);
});
