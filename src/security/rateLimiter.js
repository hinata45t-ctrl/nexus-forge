export class RateLimiter {
  constructor({ windowMs = 5000, maxCalls = 20 } = {}) {
    this.windowMs = windowMs;
    this.maxCalls = maxCalls;
    this.data = new Map();
  }

  key(instanceId, userId, command) {
    return `${String(instanceId)}:${String(userId)}:${String(command)}`;
  }

  allow(instanceId, userId, command, maxCalls = this.maxCalls, windowMs = this.windowMs) {
    const key = this.key(instanceId, userId, command);
    const now = Date.now();
    const entry = this.data.get(key) ?? { calls: [], last: now };
    entry.calls = entry.calls.filter(time => now - time < windowMs);
    entry.calls.push(now);
    this.data.set(key, entry);
    return entry.calls.length <= maxCalls;
  }
}
