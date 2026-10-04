import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const dir = process.argv[2];
if (!dir) {
  console.error('Usage: node scripts/verify-bundle.mjs <bundle-dir>');
  process.exit(2);
}

async function sha256File(path) {
  const content = await readFile(path);
  return createHash('sha256').update(content).digest('hex');
}

const manifest = JSON.parse(await readFile(join(dir, 'manifest.json'), 'utf8'));
let ok = true;

for (const entry of manifest.files ?? []) {
  const hash = await sha256File(join(dir, entry.path));
  if (hash !== entry.sha256) {
    console.error('FAIL hash', entry.path);
    ok = false;
  }
}

for (const name of ['status.json', 'facts.json', 'brief.json']) {
  try {
    await readFile(join(dir, name));
  } catch {
    console.error('FAIL missing', name);
    ok = false;
  }
}

console.log(ok ? 'PASS' : 'FAIL');
process.exit(ok ? 0 : 1);
