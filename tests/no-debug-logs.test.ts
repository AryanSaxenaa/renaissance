import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = join(import.meta.dirname, '..', 'src', 'server');

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      if (name === 'renaissance') continue;
      out.push(...walk(p));
    } else if (p.endsWith('.ts') && !p.endsWith('railway.ts')) out.push(p);
  }
  return out;
}

describe('no console.log in new server tree', () => {
  it('forbids console.log', () => {
    const files = walk(ROOT);
    for (const file of files) {
      const text = readFileSync(file, 'utf8');
      expect(text, file).not.toMatch(/\bconsole\.log\s*\(/);
    }
  });
});
