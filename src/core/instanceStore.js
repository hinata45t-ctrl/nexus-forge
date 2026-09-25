import fs from 'node:fs/promises';
import path from 'node:path';
import { instancePaths, ensureInstanceDirectories } from '../storage/paths.js';
import { FileStore } from '../storage/fileStore.js';

export class InstanceStore {
  constructor(rootDir) { this.rootDir = rootDir ?? path.resolve('instances'); this.fileStore = new FileStore(); }
  paths(id) { return instancePaths(this.rootDir, id); }
  async create(id, config) {
    if (await this.exists(id)) throw new Error(`Instance already exists: ${id}`);
    const paths = this.paths(id); await ensureInstanceDirectories(paths);
    const now = new Date().toISOString();
    await this.fileStore.writeJson(paths.config, config);
    await this.fileStore.writeJson(paths.meta, { instanceId: id, createdAt: now, updatedAt: now, status: 'created' });
    return config;
  }
  async get(id) { if (!(await this.exists(id))) throw new Error(`Instance not found: ${id}`); return this.fileStore.readJson(this.paths(id).config); }
  async getMeta(id) { return this.fileStore.readJson(this.paths(id).meta); }
  async update(id, config) { const current = await this.getMeta(id); const next = { ...config, updatedAt: new Date().toISOString() }; await this.fileStore.writeJson(this.paths(id).config, next); await this.fileStore.writeJson(this.paths(id).meta, { ...current, updatedAt: next.updatedAt }); return next; }
  async delete(id) { if (!(await this.exists(id))) return false; await fs.rm(this.paths(id).root, { recursive: true, force: true }); return true; }
  async list() { await fs.mkdir(this.rootDir, { recursive: true }); const entries = await fs.readdir(this.rootDir, { withFileTypes: true }); return Promise.all(entries.filter(e => e.isDirectory()).map(e => this.get(e.name))); }
  async exists(id) { try { await fs.access(this.paths(id).config); return true; } catch { return false; } }
}
