import { normalizeUserId, sanitizeLogData } from './permissions.js';

export class CommandPolicyEngine {
  constructor({ logger } = {}) {
    this.logger = logger;
  }

  validate(command, ctx) {
    if (!command) return { allowed: false, reason: 'COMMAND_NOT_FOUND' };
    if (command.groupOnly && !ctx.isGroup) return { allowed: false, reason: 'GROUP_ONLY' };
    if (command.ownerOnly && !ctx.isOwner) return { allowed: false, reason: 'OWNER_ONLY' };
    if (command.sudoAllowed && !ctx.isOwner && !ctx.isSudo) return { allowed: false, reason: 'SUDO_REQUIRED' };
    if (command.adminOnly && !ctx.isAdmin) return { allowed: false, reason: 'ADMIN_REQUIRED' };
    if (command.botAdminRequired && !ctx.isBotAdmin) return { allowed: false, reason: 'BOT_ADMIN_REQUIRED' };
    if (command.premiumRequired && !ctx.isPremium) return { allowed: false, reason: 'PREMIUM_REQUIRED' };
    if (command.permission === 'OWNER' && !ctx.isOwner) return { allowed: false, reason: 'OWNER_ONLY' };
    if (command.permission === 'ADMIN' && !ctx.isAdmin && !ctx.isOwner) return { allowed: false, reason: 'ADMIN_REQUIRED' };
    if (command.permission === 'SUDO' && !ctx.isOwner && !ctx.isSudo) return { allowed: false, reason: 'SUDO_REQUIRED' };
    return { allowed: true, reason: null };
  }
}
