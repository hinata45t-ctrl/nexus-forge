import { createPermissionContext, normalizeUserId } from './permissions.js';

export class PermissionManager {
  constructor({ store, logger } = {}) {
    this.store = store;
    this.logger = logger;
    this.cache = new Map();
  }

  getCacheKey(instanceId, userId) {
    return `${String(instanceId)}:${normalizeUserId(userId)}`;
  }

  async getPermissionContext({ instanceId, botId, userId, chatId, isGroup, isOwner, isSudo, isAdmin, isBotAdmin, isPremium, permissionLevel, command, args, config }) {
    const ctx = createPermissionContext({ instanceId, botId, userId, chatId, isGroup, isOwner, isSudo, isAdmin, isBotAdmin, isPremium, permissionLevel, command, args, config });
    if (ctx.userId) {
      const cacheKey = this.getCacheKey(instanceId, ctx.userId);
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (cached && cached.ts && Date.now() - cached.ts < 60000) {
          return { ...ctx, ...cached };
        }
      }
      const ownerId = await this.store?.getOwner?.(instanceId);
      const sudoUsers = await this.store?.getSudoUsers?.(instanceId) ?? [];
      const cachedValue = {
        isOwner: Boolean(ownerId && normalizeUserId(ownerId) === ctx.userId),
        isSudo: Boolean(sudoUsers.includes(ctx.userId)),
        permissionLevel: ctx.permissionLevel,
        ts: Date.now(),
      };
      this.cache.set(cacheKey, cachedValue);
      ctx.isOwner = cachedValue.isOwner;
      ctx.isSudo = cachedValue.isSudo;
      ctx.permissionLevel = cachedValue.isOwner ? 4 : cachedValue.isSudo ? 3 : ctx.permissionLevel;
    }
    return ctx;
  }

  normalizeOwner(value) {
    return normalizeUserId(value);
  }

  requireOwner(ctx, message = '❌ Cette commande est réservée à l’owner.') {
    return ctx.isOwner ? { allowed: true } : { allowed: false, reason: message };
  }

  requireSudo(ctx, message = '❌ Cette commande est réservée aux sudo.') {
    return ctx.isOwner || ctx.isSudo ? { allowed: true } : { allowed: false, reason: message };
  }

  requireBotAdmin(ctx, message = '❌ Le bot doit être administrateur.') {
    return ctx.isBotAdmin ? { allowed: true } : { allowed: false, reason: message };
  }

  requireGroupAdmin(ctx, message = '❌ Cette commande est réservée aux administrateurs du groupe.') {
    return ctx.isGroup && (ctx.isAdmin || ctx.isOwner) ? { allowed: true } : { allowed: false, reason: message };
  }

  requireGroup(ctx, message = '❌ Cette commande est disponible uniquement dans les groupes.') {
    return ctx.isGroup ? { allowed: true } : { allowed: false, reason: message };
  }

  requirePremium(ctx, message = '❌ Cette fonctionnalité nécessite Premium.') {
    return ctx.isPremium ? { allowed: true } : { allowed: false, reason: message };
  }
}
