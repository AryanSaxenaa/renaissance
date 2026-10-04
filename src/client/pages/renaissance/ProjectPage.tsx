import { Link, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import AppLayout from '@/client/components/renaissance/AppLayout';
import ReplayBanner from '@/client/components/renaissance/ReplayBanner';
import { renaissanceApi } from '@/client/lib/api';

export default function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data, isLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => renaissanceApi.getProject(projectId!),
    enabled: Boolean(projectId),
  });

  const rescan = useMutation({
    mutationFn: () => renaissanceApi.rescan(projectId!),
    onSuccess: (r) => {
      toast.success('Re-scan started');
      window.location.href = `/dossier/${r.scanId}`;
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Re-scan failed'),
  });

  const scans = data?.scans ?? [];
  const latest = scans[0];

  return (
    <AppLayout>
      <ReplayBanner />
      <div className="flex-1 overflow-y-auto p-6 max-w-3xl mx-auto">
        {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
        {data?.project && (
          <>
            <h1 className="text-xl font-bold">{data.project.title}</h1>
            <p className="text-xs font-mono opacity-60 mt-1">{data.project.patentId}</p>
            <button
              type="button"
              onClick={() => rescan.mutate()}
              disabled={rescan.isPending}
              className="mt-4 text-xs border border-technical-white/30 px-4 py-2 uppercase tracking-widest"
            >
              Re-scan (no_cache status/market)
            </button>
            <ul className="mt-6 space-y-2">
              {scans.map((s) => (
                <li key={s.id}>
                  <Link to={`/dossier/${s.id}`} className="text-sm underline font-mono">
                    {s.kind} · {s.status} · {s.id.slice(0, 8)}
                  </Link>
                </li>
              ))}
            </ul>
            {latest && (
              <Link
                to={`/dossier/${latest.id}`}
                className="inline-block mt-6 metal-button px-4 py-2 text-xs uppercase"
              >
                Open latest dossier
              </Link>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
