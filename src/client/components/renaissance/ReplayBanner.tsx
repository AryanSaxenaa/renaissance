import { useQuery } from '@tanstack/react-query';
import { renaissanceApi } from '@/client/lib/api';

export default function ReplayBanner() {
  const { data } = useQuery({
    queryKey: ['config'],
    queryFn: () => renaissanceApi.getConfig(),
    staleTime: 60_000,
  });
  if (data?.mode !== 'replay') return null;
  return (
    <div className="bg-amber-900/40 border-b border-amber-500/40 px-4 py-2 text-center text-xs font-mono tracking-wide text-amber-100">
      REPLAY MODE — Recorded fixtures only. No SerpApi credits spent. Not legal advice.
    </div>
  );
}
