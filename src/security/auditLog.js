export class AuditLog {
  constructor({ logger } = {}) {
    this.logger = logger;
    this.entries = [];
  }

  log(entry) {
    const sanitized = {
      timestamp: new Date().toISOString(),
      instanceId: entry.instanceId,
      userId: entry.userId,
      command: entry.command,
      target: entry.target,
      result: entry.result,
    };
    this.entries.push(sanitized);
    this.logger?.info(sanitized, 'Security audit log');
    return sanitized;
  }
}
