import { normalizePhone } from '../telegram/telegramUtils.js';

export const PERMISSION_LEVELS = {
  PUBLIC: 'public',
  OWNER: 'owner',
  ADMIN: 'admin',
};

export class PermissionManager {
  constructor() {
    this.rules = new Map();
  }

  canExecute(command, ctx) {
    if (!command) return false;
    if (command.ownerOnly && !ctx.isOwner) return false;
    if (command.adminOnly && !ctx.isAdmin) return false;
    return true;
  }

  normalizeOwner(value) {
    return normalizePhone(value ?? '');
  }

  isOwner(ctx) {
    if (!ctx?.config?.ownerNumber) return false;
    return this.normalizeOwner(ctx.sender?.replace?.(/[^\d+]/g, '')) === this.normalizeOwner(ctx.config.ownerNumber)
      || this.normalizeOwner(ctx.sender) === this.normalizeOwner(ctx.config.ownerNumber)
      || this.normalizeOwner(ctx.from?.phone_number) === this.normalizeOwner(ctx.config.ownerNumber)
      || this.normalizeOwner(ctx.message?.key?.participant) === this.normalizeOwner(ctx.config.ownerNumber);
  }
}
