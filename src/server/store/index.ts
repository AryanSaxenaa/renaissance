import { getConfig } from '../config.js';
import { FileStore } from './fileStore.js';
import { PgStore } from './pgStore.js';
import type { RenaissanceStore } from './interface.js';

let store: RenaissanceStore | null = null;

export async function getStore(): Promise<RenaissanceStore> {
  if (store) return store;
  const config = getConfig();
  if (config.RENAISSANCE_STORE === 'pg' && config.DATABASE_URL) {
    store = new PgStore(config.DATABASE_URL);
  } else {
    store = new FileStore();
  }
  await store.init();
  return store;
}

export function setStoreForTests(s: RenaissanceStore): void {
  store = s;
}

export type { RenaissanceStore, Project, Scan, Owner } from './interface.js';
