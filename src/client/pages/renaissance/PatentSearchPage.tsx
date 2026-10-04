import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AlertCircle, Loader2, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import AppLayout from '@/client/components/renaissance/AppLayout';
import ReplayBanner from '@/client/components/renaissance/ReplayBanner';
import { useShepherd } from '@/client/context/ShepherdContext';
import { ApiError, renaissanceApi, type PatentSearchHit } from '@/client/lib/api';
import { SHEPHERD_DEMO_SCAN_ID } from '@/client/lib/shepherdStorage';

const SAMPLE_QUERIES = ['centrifugal governor'];

function statusChip(countryStatus?: Record<string, string>) {
  if (!countryStatus) return 'Unknown';
  const values = Object.values(countryStatus);
  if (values.every((v) => v.toUpperCase().includes('NOT'))) return 'Pre-screen: not active';
  if (values.some((v) => v.toUpperCase().includes('ACTIVE'))) return 'Pre-screen: active somewhere';
  return values[0] ?? 'Unknown';
}

function HitCard({
  hit,
  onOpen,
  loading,
  featured,
}: {
  hit: PatentSearchHit;
  onOpen: () => void;
  loading: boolean;
  featured?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      disabled={loading}
      className={`index-card w-full text-left p-4 border transition-colors disabled:opacity-50 ${
        featured
          ? 'border-amber-500 ring-2 ring-amber-400/50'
          : 'border-technical-white/20 hover:border-technical-white/40'
      }`}
    >
      {featured && (
        <span className="text-[9px] uppercase tracking-widest text-amber-800 font-bold block mb-1">
          Tour pick · open this dossier
        </span>
      )}
      <div className="flex justify-between gap-2 mb-2">
        <span className="text-[10px] font-mono opacity-70">{hit.patent_id}</span>
        <span className="text-[9px] uppercase px-1 bg-white/10">{statusChip(hit.country_status)}</span>
      </div>
      <h3 className="font-bold text-sm mb-1">{hit.title}</h3>
      {hit.snippet && <p className="text-xs opacity-70 line-clamp-2">{hit.snippet}</p>}
      {hit.filing_date && (
        <p className="text-[10px] font-mono mt-2 opacity-50">Filing: {hit.filing_date}</p>
      )}
    </button>
  );
}

export default function PatentSearchPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { active: shepherdActive, pack: shepherdPack, goToStep } = useShepherd();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [submitted, setSubmitted] = useState(initialQuery);
  const [city, setCity] = useState('Pune');
  const [accessCode, setAccessCode] = useState('');

  useEffect(() => {
    if (shepherdActive && shepherdPack) {
      setQuery(shepherdPack.query);
      setSubmitted(shepherdPack.query);
      setCity(shepherdPack.city);
    }
  }, [shepherdActive, shepherdPack]);

  const { data: config } = useQuery({
    queryKey: ['config'],
    queryFn: () => renaissanceApi.getConfig(),
  });

  const { data: estimate } = useQuery({
    queryKey: ['estimate', 'search'],
    queryFn: () => renaissanceApi.estimateCredits('search'),
  });

  const useShepherdSearch =
    shepherdActive && shepherdPack !== null && submitted === shepherdPack.query;

  const {
    data: liveSearchResult,
    isFetching,
    error: searchError,
  } = useQuery({
    queryKey: ['search', submitted],
    queryFn: () => renaissanceApi.search(submitted, accessCode || undefined),
    enabled: submitted.length > 0 && !useShepherdSearch,
  });

  const searchResult = useShepherdSearch ? shepherdPack!.search : liveSearchResult;

  const startScan = useMutation({
    mutationFn: (hit: PatentSearchHit) =>
      renaissanceApi.startScan(
        {
          patentId: hit.patent_id,
          query: submitted,
          city,
          title: hit.title,
        },
        accessCode || undefined,
      ),
    onSuccess: (data) => {
      toast.success('Dossier scan started');
      navigate(`/dossier/${data.scanId}`);
    },
    onError: (err) => {
      if (err instanceof ApiError && err.status === 401) {
        toast.error('Live mode requires access code (Settings).');
      } else {
        toast.error(err instanceof Error ? err.message : 'Could not start scan');
      }
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSubmitted(query.trim());
  };

  return (
    <AppLayout>
      <ReplayBanner />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <header>
            <h1 className="text-2xl font-bold tracking-tight">Candidate discovery</h1>
            <p className="text-sm opacity-70 mt-1">
              Old grants with pre-screen status chips. Open a dossier for evidence-based legal status and a cited brief.
            </p>
            {config && (
              <p className="text-[10px] font-mono mt-2 opacity-50">
                Mode: {config.mode} · Search cost: {estimate?.credits ?? 1} credit(s) in live mode
              </p>
            )}
          </header>

          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent border border-technical-white/30 pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-technical-white/50"
                placeholder="Mechanism or keywords (e.g. centrifugal governor)"
              />
            </div>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="bg-cyanotype-dark border border-technical-white/30 px-3 text-xs"
            >
              <option value="Pune">Pune</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Bangalore">Bangalore</option>
            </select>
            <button
              type="submit"
              className="metal-button px-6 py-3 text-xs font-bold tracking-widest uppercase"
            >
              Search
            </button>
          </form>

          <div className="flex flex-wrap gap-2">
            {SAMPLE_QUERIES.map((q) => (
              <button
                key={q}
                type="button"
                className="text-[10px] font-mono border border-technical-white/20 px-2 py-1 opacity-70 hover:opacity-100"
                onClick={() => {
                  setQuery(q);
                  setSubmitted(q);
                }}
              >
                Sample: {q}
              </button>
            ))}
          </div>

          {shepherdActive && (
            <p className="shepherd-surface text-xs border border-slate-200 px-3 py-2 shadow-sm">
              Shepherd mode: preloaded replay results. Exit the tour from the step card to run live searches.
            </p>
          )}

          {config?.mode === 'live' && !shepherdActive && (
            <label className="block text-xs">
              <span className="opacity-60">Access code (live)</span>
              <input
                type="password"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                className="mt-1 w-full max-w-xs bg-transparent border border-technical-white/30 px-3 py-2 font-mono text-sm"
                autoComplete="off"
              />
            </label>
          )}

          {isFetching && (
            <div className="flex items-center gap-2 text-sm opacity-70">
              <Loader2 className="w-4 h-4 animate-spin" /> Searching patents…
            </div>
          )}

          {searchError && (
            <div className="flex items-center gap-2 text-red-300 text-sm">
              <AlertCircle className="w-4 h-4" />
              {(searchError as Error).message}
            </div>
          )}

          <div className="grid gap-3">
            {searchResult?.hits.map((hit) => (
              <HitCard
                key={hit.patent_id}
                hit={hit}
                featured={shepherdActive && hit.patent_id === shepherdPack?.featuredPatentId}
                loading={startScan.isPending}
                onOpen={() => {
                  if (shepherdActive && shepherdPack) {
                    navigate(`/dossier/${SHEPHERD_DEMO_SCAN_ID}`);
                    goToStep(2);
                    return;
                  }
                  startScan.mutate(hit);
                }}
              />
            ))}
          </div>

          {searchResult?.receipt?.searchMetadataId && (
            <p className="text-[10px] font-mono opacity-40">
              Receipt: {searchResult.receipt.searchMetadataId}
            </p>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
