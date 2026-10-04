import { Loader2 } from 'lucide-react';
import { useShepherd } from '@/client/context/ShepherdContext';

export default function ShepherdOfferModal() {
  const { decision, active, loading, acceptTour, declineTour } = useShepherd();

  if (decision !== 'unset' || active) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-6">
      <div
        className="max-w-md w-full border border-technical-white/30 bg-cyanotype-dark p-6 shadow-2xl"
        role="dialog"
        aria-labelledby="shepherd-offer-title"
      >
        <p className="text-[10px] font-mono tracking-[0.3em] opacity-50 mb-2">OPTIONAL</p>
        <h2 id="shepherd-offer-title" className="text-xl font-bold tracking-tight mb-3">
          Guided tour (Shepherd mode)
        </h2>
        <p className="text-sm opacity-80 leading-relaxed mb-4">
          Walk through a real centrifugal-governor dossier with preloaded replay evidence—status rules, cited brief, and
          SerpApi receipts. No access code or credits until you exit the tour.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={() => void acceptTour()}
            className="metal-button flex-1 py-3 text-xs font-bold tracking-widest uppercase disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading…
              </span>
            ) : (
              'Start tour'
            )}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={declineTour}
            className="flex-1 py-3 text-xs font-bold tracking-widest uppercase border border-technical-white/30 hover:bg-white/5"
          >
            Skip — use live app
          </button>
        </div>
      </div>
    </div>
  );
}
