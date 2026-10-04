import { execSync } from 'node:child_process';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const patterns = [
  /api_key\s*=\s*['"]?[a-zA-Z0-9]{8,}/i,
  /Bearer\s+[a-zA-Z0-9._-]{10,}/,
  /\bsk-[a-zA-Z0-9]{10,}/,
  /[A-Z_]+_API_KEY\s*=\s*\S+/,
];

function walk(dir: string, acc: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === '.git' || name === 'dist') continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, acc);
    else acc.push(p);
  }
  return acc;
}

const root = join(import.meta.dirname, '..');
const scanHistory = process.argv.includes('--history');
let failed = false;

for (const file of walk(root)) {
  if (!/\.(ts|tsx|js|json|md|env\.example|yaml|yml)$/.test(file)) continue;
  if (file.includes('secret-scan')) continue;
  const text = readFileSync(file, 'utf8');
  for (const pattern of patterns) {
    if (pattern.test(text) && !text.includes('your_') && !text.includes('placeholder')) {
      if (/[A-Fa-f0-9]{32,64}/.test(pattern.source) && file.endsWith('.json') && file.includes('fixtures')) continue;
      console.error(`pattern ${pattern} matched ${file}`);
      failed = true;
    }
  }
}

if (scanHistory) {
  try {
    const log = execSync('git log -p --max-count=50', { cwd: root, encoding: 'utf8' });
    if (/\bsk-[a-zA-Z0-9]{10,}/.test(log)) {
      console.error('history may contain sk- token');
      failed = true;
    }
  } catch {
    console.warn('git history scan skipped');
  }
}

if (failed) process.exit(1);
console.log('secret-scan: ok');
