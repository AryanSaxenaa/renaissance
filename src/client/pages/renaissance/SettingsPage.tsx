import { useQuery } from '@tanstack/react-query';
import AppLayout from '@/client/components/renaissance/AppLayout';
import ReplayBanner from '@/client/components/renaissance/ReplayBanner';
import { renaissanceApi } from '@/client/lib/api';

export default function SettingsPage() {
  const { data: config } = useQuery({
    queryKey: ['config'],
    queryFn: () => renaissanceApi.getConfig(),
  });

  const { data: budget } = useQuery({
    queryKey: ['budget'],
    queryFn: () => renaissanceApi.getBudget(),
  });

  return (
    <AppLayout>
      <ReplayBanner />
      <div className="flex-1 overflow-y-auto p-6 max-w-2xl mx-auto w-full">
        <h1 className="text-2xl font-bold mb-6">Configuration</h1>
        <div className="space-y-6 text-sm border border-technical-white/20 p-6">
          <div>
            <p className="text-[10px] uppercase tracking-widest opacity-50">Mode</p>
            <p className="font-mono text-lg">{config?.mode ?? '…'}</p>
            <p className="text-xs opacity-70 mt-1">
              Replay uses fixtures with no API keys. Live mode spends SerpApi credits when configured.
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest opacity-50">SerpApi</p>
            <p>{config?.serpapiEnabled ? 'Enabled (live)' : 'Disabled / replay'}</p>
          </div>
          {config?.limits && (
            <div>
              <p className="text-[10px] uppercase tracking-widest opacity-50">Credit limits</p>
              <ul className="font-mono text-xs mt-2 space-y-1">
                <li>Daily cap: {config.limits.dailyCreditCap}</li>
                <li>Monthly hard cap: {config.limits.monthlyHardCap}</li>
                <li>Per brief cap: {config.limits.perBriefCap}</li>
              </ul>
            </div>
          )}
          {budget && (
            <div>
              <p className="text-[10px] uppercase tracking-widest opacity-50">Budget snapshot</p>
              <pre className="text-xs font-mono mt-2 opacity-80 overflow-auto">
                {JSON.stringify(budget, null, 2)}
              </pre>
            </div>
          )}
          <p className="text-xs opacity-60 border-t border-technical-white/10 pt-4">
            Access codes are never stored in the browser. For public live demos, enter your code on the search page when
            prompted.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
