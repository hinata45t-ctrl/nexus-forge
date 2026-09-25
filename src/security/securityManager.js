export class SecurityManager {
  constructor({ logger, store } = {}) {
    this.logger = logger;
    this.store = store;
    this.audit = new AuditLog({ logger });
    this.rateLimiter = new RateLimiter();
    this.policy = new CommandPolicyEngine({ logger });
    this.permissionManager = new PermissionManager({ store, logger });
  }

  async ensurePermission(command, ctx) {
    const policy = this.policy.validate(command, ctx);
    if (!policy.allowed) return { allowed: false, reason: policy.reason };
    if (!this.rateLimiter.allow(ctx.instanceId, ctx.userId, command.name, command.maxCalls ?? 20, command.windowMs ?? 5000)) {
      return { allowed: false, reason: 'RATE_LIMITED' };
    }
    return { allowed: true };
  }
}
