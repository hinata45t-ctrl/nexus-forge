import path from 'node:path';
import fs from 'node:fs/promises';
export function instancePaths(root, id) { const base = path.resolve(root, id); return { root: base, config: path.join(base, 'config.json'), meta: path.join(base, 'meta.json'), data: path.join(base, 'data'), assets: path.join(base, 'assets'), session: path.join(base, 'session'), logs: path.join(base, 'logs') }; }
export async function ensureInstanceDirectories(paths) { await Promise.all([paths.data, paths.assets, paths.session, paths.logs].map(dir => fs.mkdir(dir, { recursive: true }))); }
export function sessionPath(root, id) { return instancePaths(root, id).session; }
export function assetsPath(root, id) { return instancePaths(root, id).assets; }
