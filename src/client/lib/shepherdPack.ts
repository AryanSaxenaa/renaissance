import type { ScanResponse, SearchResponse } from '@/client/lib/api';
import { SHEPHERD_DEMO_SCAN_ID } from './shepherdStorage';

export type ShepherdPack = {
  query: string;
  city: string;
  search: SearchResponse;
  scan: ScanResponse;
  featuredPatentId: string;
  demoScanId: string;
};

let cached: ShepherdPack | null = null;

export async function loadShepherdPack(): Promise<ShepherdPack> {
  if (cached) return cached;
  const res = await fetch('/demo/shepherd-pack.json');
  if (!res.ok) throw new Error('shepherd_pack_unavailable');
  cached = (await res.json()) as ShepherdPack;
  return cached;
}

export function demoScanFromPack(pack: ShepherdPack): ScanResponse {
  return {
    ...pack.scan,
    id: SHEPHERD_DEMO_SCAN_ID,
  };
}
