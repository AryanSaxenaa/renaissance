import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Printer } from 'lucide-react';
import AppLayout from '@/client/components/renaissance/AppLayout';
import ReplayBanner from '@/client/components/renaissance/ReplayBanner';
import StatusStamp from '@/client/components/renaissance/StatusStamp';
import BriefSheet from '@/client/components/renaissance/BriefSheet';
import FactCitation from '@/client/components/renaissance/FactCitation';
import { renaissanceApi } from '@/client/lib/api';

const TABS = ['Status', 'Market', 'Literature', 'News', 'Brief', 'Evidence'] as const;
type Tab = (typeof TABS)[number];

export default function DossierPage() {
  const { scanId } = useParams<{ scanId: string }>();
  const [tab, setTab] = useState<Tab>('Status');

  const { data: scan, isLoading, error, refetch } = useQuery({
    queryKey: ['scan', scanId],
    queryFn: () => renaissanceApi.getScan(scanId!),
    enabled: Boolean(scanId),
    refetchInterval: (q) => (q.state.data?.status === 'complete' || q.state.data?.status === 'failed' ? false : 1500),
  });

  const marketFacts = scan?.facts.filter((f) => f.kind === 'market' || f.kind === 'maker') ?? [];
  const paperFacts = scan?.facts.filter((f) => f.kind === 'paper') ?? [];
  const newsFacts = scan?.facts.filter((f) => f.kind === 'news') ?? [];
  const statusFacts = scan?.facts.filter((f) => f.kind === 'status' || f.kind === 'patent_text') ?? [];

  return (
    <AppLayout>
      <ReplayBanner />
      <div className="flex-1 overflow-y-auto p-6 max-w-6xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link to="/search" className="text-xs font-mono opacity-60 hover:opacity-100">
              ← Candidates
            </Link>
            <h1 className="text-2xl font-bold tracking-tight mt-1">Patent dossier</h1>
            <p className="text-xs font-mono opacity-60">Scan {scanId}</p>
          </div>
          {scan?.status === 'complete' && scan.brief && (
            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-2 border border-technical-white/30 px-3 py-2 text-xs uppercase tracking-widest hover:bg-white/5"
            >
              <Printer className="w-4 h-4" /> Print brief
            </button>
          )}
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 text-sm opacity-70">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading dossier…
          </div>
        )}
        {error && (
          <p className="text-red-300 text-sm">{(error as Error).message}</p>
        )}

        {scan && scan.status !== 'complete' && scan.status !== 'failed' && (
          <p className="text-sm font-mono animate-pulse mb-4">Gathering evidence ({scan.status})…</p>
        )}

        {scan?.statusReport && (
          <div className="mb-6">
            <StatusStamp
              verdict={scan.statusReport.headline}
              confidence={scan.statusReport.confidence}
              office={scan.statusReport.ownOffice}
            />
          </div>
        )}

        <nav className="flex flex-wrap gap-2 mb-6 border-b border-technical-white/10 pb-2">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`text-xs px-3 py-1 font-mono tracking-wide ${tab === t ? 'bg-technical-white/10 border border-technical-white/30' : 'opacity-60'}`}
            >
              {t}
            </button>
          ))}
        </nav>

        {scan?.status === 'failed' && (
          <p className="text-amber-200 text-sm mb-4">Scan failed. <button type="button" className="underline" onClick={() => refetch()}>Retry view</button></p>
        )}

        {tab === 'Status' && scan?.statusReport && (
          <div className="space-y-4 text-sm">
            <p>{scan.brief?.statusLine ?? 'Status line pending.'}</p>
            <div>
              <h3 className="text-xs uppercase tracking-widest opacity-60 mb-2">Family members</h3>
              <ul className="font-mono text-xs space-y-1">
                {scan.statusReport.members.map((m) => (
                  <li key={m.appNo}>
                    {m.office} · {m.cat} · {m.appNo} {m.thisApp ? '(this app)' : ''}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xs uppercase tracking-widest opacity-60 mb-2">Not checked</h3>
              <ul className="list-disc list-inside opacity-80">
                {scan.statusReport.notChecked.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            </div>
            <ul className="space-y-2">
              {statusFacts.map((f) => (
                <li key={f.id} className="border-l border-technical-white/20 pl-3">
                  {f.text}
                  <FactCitation factIds={[f.id]} />
                </li>
              ))}
            </ul>
          </div>
        )}

        {tab === 'Market' && (
          <ul className="space-y-2 text-sm">
            {marketFacts.length === 0 && <li className="opacity-60">No market facts yet.</li>}
            {marketFacts.map((f) => (
              <li key={f.id}>
                {f.text}
                <FactCitation factIds={[f.id]} />
              </li>
            ))}
          </ul>
        )}

        {tab === 'Literature' && (
          <ul className="space-y-2 text-sm">
            {paperFacts.map((f) => (
              <li key={f.id}>
                {f.text}
                <FactCitation factIds={[f.id]} />
              </li>
            ))}
          </ul>
        )}

        {tab === 'News' && (
          <ul className="space-y-2 text-sm">
            {newsFacts.map((f) => (
              <li key={f.id}>
                {f.text}
                <FactCitation factIds={[f.id]} />
              </li>
            ))}
          </ul>
        )}

        {tab === 'Brief' && scan?.brief && (
          <BriefSheet brief={scan.brief} facts={scan.facts} printable />
        )}

        {tab === 'Evidence' && scan && (
          <div className="text-xs font-mono space-y-2">
            <p>Credits recorded for this scan: {scan.credits}</p>
            <p>Mode: {scan.mode}</p>
            <ul className="space-y-1 opacity-80">
              {[...new Set(scan.facts.map((f) => f.source.searchMetadataId).filter(Boolean))].map((id) => (
                <li key={id}>search_metadata.id: {id}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
