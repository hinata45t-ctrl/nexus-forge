import fs from 'node:fs/promises';
export class FileStore {
  async writeJson(file, value) { await fs.mkdir(new URL('.', `file://${file}`).pathname, { recursive: true }).catch(() => {}); await fs.writeFile(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8'); }
  async readJson(file) { return JSON.parse(await fs.readFile(file, 'utf8')); }
}
