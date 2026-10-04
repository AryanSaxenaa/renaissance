import AppLayout from '@/client/components/renaissance/AppLayout';
import ReplayBanner from '@/client/components/renaissance/ReplayBanner';

export default function MethodPage() {
  return (
    <AppLayout>
      <ReplayBanner />
      <div className="flex-1 overflow-y-auto p-6 max-w-3xl mx-auto prose-invert text-sm leading-relaxed space-y-4">
        <h1 className="text-2xl font-bold">Method</h1>
        <p>
          Renaissance does not treat filing date plus twenty years as a legal verdict. That date arithmetic is only a
          consistency check inside the status engine. The headline verdict comes from Google Patents details: per-member
          legal status, legal events, and family relationships (rules R1–R8).
        </p>
        <h2 className="text-lg font-semibold">What we do not check</h2>
        <ul className="list-disc list-inside opacity-80 space-y-1">
          <li>Jurisdictions outside the retrieved family</li>
          <li>Design patents, trademarks, trade dress</li>
          <li>Term adjustments, extensions, reinstatement</li>
          <li>Licensing assignments and unpaid-fee grace periods</li>
        </ul>
        <h2 className="text-lg font-semibold">Facts and briefs</h2>
        <p>
          Each SerpApi call stores a receipt (<code className="font-mono text-xs">search_metadata.id</code>). Facts merge
          status, patent text, market, makers, literature, and news. The design brief generator may only cite fact ids; a
          deterministic verifier removes numerals not present in cited facts. This is not legal advice.
        </p>
        <h2 className="text-lg font-semibold">Replay mode</h2>
        <p>
          With no API key, the server uses recorded fixtures under <code className="font-mono text-xs">fixtures/replay/</code>{' '}
          so judges can run the full flow offline.
        </p>
      </div>
    </AppLayout>
  );
}
