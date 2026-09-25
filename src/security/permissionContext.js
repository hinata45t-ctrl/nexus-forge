export const PERMISSION_LEVELS = {
  MEMBER: 0,
  GROUP_MEMBER: 1,
  GROUP_ADMIN: 2,
  SUDO: 3,
  OWNER: 4,
  SYSTEM_ADMIN: 5,
};

export function normalizeUserId(value) {
  if (value == null) return '';
  const normalized = String(value).trim().replace(/\s+/g, '').replace(/^@/, '');
  if (!normalized) return '';
  const digits = normalized.replace(/[^\d]/g, '');
  return digits ? digits.replace(/^0+/, '') : normalized.replace(/^\+/, '');
}

export function sanitizeLogData(value) {
  if (value == null) return value;
  if (typeof value === 'string') {
    return value
      .replace(/(\b[A-Z0-9_]{20,}\b)/g, '[REDACTED]')
      .replace(/(telegram.*token|token.*=|botToken|session.*[A-Za-z0-9]+|api[_-]?key|secret|password)/gi, '[REDACTED]');
  }
  if (Array.isArray(value)) return value.map(sanitizeLogData);
  if (typeof value === 'object') {
    const clone = {};
    for (const [key, item] of Object.entries(value)) {
      clone[key] = sanitizeLogData(item);
    }
    return clone;
  }
  return value;
}

export function createPermissionContext({ instanceId, botId, userId, chatId, isGroup = false, isOwner = false, isSudo = false, isAdmin = false, isBotAdmin = false, isPremium = false, permissionLevel = PERMISSION_LEVELS.MEMBER, command = '', args = [], config = {} }) {
  return {
    instanceId,
    botId,
    userId: normalizeUserId(userId),
    chatId,
    isGroup,
    isOwner,
    isSudo,
    isAdmin,
    isBotAdmin,
    isPremium,
    permissionLevel,
    command,
    args,
    config,
  };
}
