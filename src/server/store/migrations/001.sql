create table if not exists owners (
  id uuid primary key,
  token_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists projects (
  id uuid primary key,
  owner_id uuid references owners(id) on delete cascade,
  title text not null,
  query text not null,
  patent_id text not null,
  city text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists scans (
  id uuid primary key,
  project_id uuid references projects(id) on delete cascade,
  kind text not null check (kind in ('initial','rescan')),
  mode text not null,
  status text not null default 'pending',
  status_report jsonb,
  facts jsonb not null default '[]',
  brief jsonb,
  removed_by_verifier int default 0,
  credits int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists serpapi_calls (
  id uuid primary key,
  scan_id uuid references scans(id) on delete cascade,
  patent_id text,
  engine text not null,
  params_redacted jsonb not null,
  search_metadata_id text,
  json_endpoint text,
  http_status int,
  credits int not null,
  cache_hit boolean not null,
  latency_ms int,
  raw_key text,
  sha256_raw text,
  created_at timestamptz not null default now()
);

create table if not exists serpapi_cache (
  key text primary key,
  engine text not null,
  body jsonb not null,
  search_metadata_id text,
  created_at timestamptz not null default now(),
  expires_at timestamptz
);

create index if not exists scans_project_created_idx on scans (project_id, created_at desc);
create index if not exists serpapi_calls_scan_idx on serpapi_calls (scan_id);
