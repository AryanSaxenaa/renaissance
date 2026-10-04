import { useEffect, useState } from 'react';
import AppLayout from '@/client/components/renaissance/AppLayout';
import ReplayBanner from '@/client/components/renaissance/ReplayBanner';

type EvalReport = {
  n: number;
  statusComparison: {
    falseFreeRate: { formatted: string; count: number; denom: number };
    missRate: { formatted: string };
    uncertaintyRate: number;
    naiveVsEngineDisagreements: number;
    rows: Array<{ id: string; engineHeadline: string; humanStatus: string }>;
  };
  groundingAudit: { claimsChecked: number; violations: number };
};

export default function EvaluationPage() {
  const [report, setReport] = useState<EvalReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/eval/report.json')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('no report'))))
      .then(setReport)
      .catch(() => setError('No evaluation report yet. Run npm run eval -- --set=tests-mini'));
  }, []);

  return (
    <AppLayout>
      <ReplayBanner />
      <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Evaluation</h1>
        <p className="text-sm opacity-70 mb-6">Naive filing+20y rule vs evidence-based status engine (synthetic mini set).</p>
        {error && <p className="text-amber-200 text-sm">{error}</p>}
        {report && (
          <div className="space-y-6 text-sm">
            <table className="w-full border border-technical-white/20 text-left">
              <tbody>
                <tr className="border-b border-technical-white/10">
                  <td className="p-2 opacity-60">Labels (n)</td>
                  <td className="p-2 font-mono">{report.n}</td>
                </tr>
                <tr className="border-b border-technical-white/10">
                  <td className="p-2 opacity-60">False-free rate</td>
                  <td className="p-2 font-mono">
                    {report.statusComparison.falseFreeRate.formatted} ({report.statusComparison.falseFreeRate.count}/
                    {report.statusComparison.falseFreeRate.denom})
                  </td>
                </tr>
                <tr className="border-b border-technical-white/10">
                  <td className="p-2 opacity-60">Miss rate (human free, engine not)</td>
                  <td className="p-2 font-mono">{report.statusComparison.missRate.formatted}</td>
                </tr>
                <tr className="border-b border-technical-white/10">
                  <td className="p-2 opacity-60">Uncertainty rate</td>
                  <td className="p-2 font-mono">{(report.statusComparison.uncertaintyRate * 100).toFixed(1)}%</td>
                </tr>
                <tr className="border-b border-technical-white/10">
                  <td className="p-2 opacity-60">Naive vs engine disagreements</td>
                  <td className="p-2 font-mono">{report.statusComparison.naiveVsEngineDisagreements}</td>
                </tr>
                <tr>
                  <td className="p-2 opacity-60">Grounding violations</td>
                  <td className="p-2 font-mono">
                    {report.groundingAudit.violations} / {report.groundingAudit.claimsChecked} claims
                  </td>
                </tr>
              </tbody>
            </table>
            <ul className="font-mono text-xs space-y-1">
              {report.statusComparison.rows.map((row) => (
                <li key={row.id}>
                  {row.id}: human={row.humanStatus} engine={row.engineHeadline}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
