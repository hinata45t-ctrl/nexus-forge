import fs from 'node:fs/promises';
import path from 'node:path';
import { sessionPath } from '../storage/paths.js';
export class SessionManager {
  constructor(rootDir) { this.rootDir = rootDir ?? path.resolve('instances'); }
  getSessionPath(id) { return sessionPath(this.rootDir, id); }
  async sessionExists(id) { try { await fs.access(this.getSessionPath(id)); return true; } catch { return false; } }
  async clearSession(id) { await fs.rm(this.getSessionPath(id), { recursive: true, force: true }); }
}
