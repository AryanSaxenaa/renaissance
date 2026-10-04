import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, FolderOpen } from 'lucide-react';
import AppLayout from '@/client/components/renaissance/AppLayout';
import ReplayBanner from '@/client/components/renaissance/ReplayBanner';
import { renaissanceApi } from '@/client/lib/api';

export default function ArchivePage() {
  const { data, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => renaissanceApi.listProjects(),
  });

  return (
    <AppLayout>
      <ReplayBanner />
      <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full">
        <h1 className="text-2xl font-bold mb-2">Saved briefs</h1>
        <p className="text-sm opacity-70 mb-6">Projects are scoped to this browser session (anonymous owner cookie).</p>

        {isLoading && (
          <div className="flex items-center gap-2 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading…
          </div>
        )}

        <ul className="space-y-3">
          {(data?.projects ?? []).map((p) => (
            <li key={p.id} className="border border-technical-white/20 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-bold">{p.title}</p>
                  <p className="text-xs font-mono opacity-60">{p.patentId}</p>
                  <p className="text-[10px] opacity-50 mt-1">Query: {p.query}</p>
                </div>
                <Link
                  to={`/archive/${p.id}`}
                  className="text-xs uppercase tracking-widest border border-technical-white/30 px-3 py-2 hover:bg-white/5"
                >
                  Open
                </Link>
              </div>
            </li>
          ))}
        </ul>

        {!isLoading && (data?.projects?.length ?? 0) === 0 && (
          <div className="text-center py-16 opacity-60">
            <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-40" />
            <p className="text-sm">No saved dossiers yet. Run a search and open a dossier.</p>
            <Link to="/search" className="inline-block mt-4 text-xs underline">
              Go to search
            </Link>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
