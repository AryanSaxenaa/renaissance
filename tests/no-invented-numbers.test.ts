import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = join(import.meta.dirname, '..', 'src', 'server');
const BANNED = [/442\.8\s*Nm/i, /18\.2\s*MPa/i, /40%\s*weight/i];

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      if (name === 'renaissance') continue;
      out.push(...walk(p));
    } else if (p.endsWith('.ts')) out.push(p);
  }
  return out;
}

describe('no invented benchmark numbers in new server code', () => {
  it('grep banned literals', () => {
    const files = walk(ROOT);
    for (const file of files) {
      const text = readFileSync(file, 'utf8');
      for (const pattern of BANNED) {
        expect(text, file).not.toMatch(pattern);
      }
    }
  });
});
