import { PermissionManager } from './permissionManager.js';

export class PermissionManager {
  constructor() {
    this.rules = new Map();
  }

  canExecute(command, ctx) {
    if (!command) return false;
    if (command.groupOnly && !ctx.isGroup) return false;
    if (command.ownerOnly && !ctx.isOwner) return false;
    if (command.adminOnly && !ctx.isAdmin) return false;
    return true;
  }

  normalizeOwner(value) {
    const cleaned = String(value ?? '').trim().replace(/\s+/g, '').replace(/\+/g, '');
    return cleaned.replace(/[^\d]/g, '');
  }

  isOwner(ctx) {
    if (!ctx?.config?.ownerNumber) return false;
    const owner = this.normalizeOwner(ctx.config.ownerNumber);
    const sender = this.normalizeOwner(ctx.sender ?? ctx.from?.phone_number ?? ctx.message?.key?.participant ?? '');
    return sender === owner;
  }
}
