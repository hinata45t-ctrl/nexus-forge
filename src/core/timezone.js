export function validTimeZone(zone) { try { Intl.DateTimeFormat(undefined, { timeZone: zone }); return true; } catch { return false; } }
