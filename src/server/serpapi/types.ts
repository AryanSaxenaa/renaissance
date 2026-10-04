export type SerpEngine =
  | 'google_patents'
  | 'google_patents_details'
  | 'google_shopping'
  | 'google_maps'
  | 'google_scholar'
  | 'google_news';

export type SerpParams = Record<string, string | number | boolean | undefined>;

export type SearchMetadata = {
  id?: string;
  status?: string;
  json_endpoint?: string;
};

export type SerpResponse = {
  search_metadata?: SearchMetadata;
  search_parameters?: Record<string, unknown>;
  error?: string;
  [key: string]: unknown;
};

export type SerpReceipt = {
  callId: string;
  scanId?: string;
  patentId?: string;
  engine: SerpEngine;
  paramsRedacted: SerpParams;
  searchMetadataId: string | null;
  jsonEndpoint: string | null;
  httpStatus: number;
  credits: number;
  cacheHit: boolean;
  latencyMs: number;
  rawKey: string;
  sha256Raw: string;
  createdAt: string;
};

export type TransportRequest = {
  engine: SerpEngine;
  params: SerpParams;
  noCache?: boolean;
};

export type TransportResult = {
  body: SerpResponse;
  httpStatus: number;
  fromCache: boolean;
  fromReplay: boolean;
};

export interface SerpTransport {
  execute(req: TransportRequest): Promise<TransportResult>;
}

export const ENGINE_CREDITS: Record<SerpEngine, number> = {
  google_patents: 1,
  google_patents_details: 1,
  google_shopping: 1,
  google_maps: 1,
  google_scholar: 1,
  google_news: 1,
};
