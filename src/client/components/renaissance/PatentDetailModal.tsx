import { X, FlaskConical, Loader2, Calendar, Users, FileText, Tag, ExternalLink, Radar } from 'lucide-react';
import { cn } from '@/client/lib/utils';

export interface PatentDetail {
  patentId: string;
  title: string;
  abstract: string;
  filingYear: number;
  expiryYear: number;
  isExpired: boolean;
  division: string;
  inventors: string[];
  claims?: string[];
}

export interface PatentDiligenceBrief {
  opportunityScore: number;
  scoreLabel: 'HIGH' | 'MEDIUM' | 'LOW';
  demandSignals: string[];
  competitorSignals: string[];
  sources: Array<{ title: string; url: string; type: 'MARKET' | 'NEWS' }>;
  generatedAt: string;
}

interface PatentDetailModalProps {
  patent: PatentDetail;
  onClose: () => void;
  onRemix: () => void;
  isRemixing?: boolean;
  diligence?: PatentDiligenceBrief;
  isLoadingDiligence?: boolean;
}

export default function PatentDetailModal({
  patent,
  onClose,
  onRemix,
  isRemixing = false,
  diligence,
  isLoadingDiligence = false,
}: PatentDetailModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col border border-technical-white/30 bg-cyanotype-dark shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-technical-white/20 shrink-0">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] opacity-50 tracking-widest">REF: {patent.patentId}</span>
              <h2 className="text-2xl font-bold mt-1">{patent.title}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 border border-technical-white/20 hover:bg-technical-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Status Badge */}
          <div className="mt-4 flex items-center gap-4">
            <span
              className={cn(
                'text-[10px] font-bold px-3 py-1 uppercase',
                patent.isExpired ? 'bg-red-900/50 text-red-300' : 'bg-blue-900/50 text-blue-300'
              )}
            >
              {patent.isExpired ? 'EXPIRED - AVAILABLE FOR REMIX' : 'ACTIVE PATENT'}
            </span>
            <span className="text-[10px] opacity-50">
              Division: {patent.division}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 scrollbar-blueprint">
          {/* Abstract */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-amber-glow" />
              <h3 className="text-xs font-bold tracking-widest opacity-60">ABSTRACT</h3>
            </div>
            <p className="text-sm leading-relaxed opacity-80">{patent.abstract}</p>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-3 gap-6">
            <div className="border border-technical-white/10 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-amber-glow" />
                <span className="text-[10px] opacity-50 uppercase tracking-widest">Filing Date</span>
              </div>
              <p className="text-lg font-bold">{patent.filingYear}</p>
            </div>
            <div className="border border-technical-white/10 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-amber-glow" />
                <span className="text-[10px] opacity-50 uppercase tracking-widest">Expiry Year</span>
              </div>
              <p className={cn('text-lg font-bold', patent.isExpired && 'text-amber-glow')}>
                {patent.expiryYear}
              </p>
            </div>
            <div className="border border-technical-white/10 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Tag className="w-4 h-4 text-amber-glow" />
                <span className="text-[10px] opacity-50 uppercase tracking-widest">Division</span>
              </div>
              <p className="text-lg font-bold">{patent.division}</p>
            </div>
          </div>

          {/* Inventors */}
          {patent.inventors.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-amber-glow" />
                <h3 className="text-xs font-bold tracking-widest opacity-60">INVENTORS</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {patent.inventors.map((inventor, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 border border-technical-white/20 text-xs"
                  >
                    {inventor}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Claims */}
          {patent.claims && patent.claims.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-amber-glow" />
                <h3 className="text-xs font-bold tracking-widest opacity-60">CLAIMS ({patent.claims.length})</h3>
              </div>
              <div className="space-y-3">
                {patent.claims.map((claim, i) => (
                  <div
                    key={i}
                    className="flex gap-3 text-sm"
                  >
                    <span className="text-amber-glow font-bold">{i + 1}.</span>
                    <span className="opacity-70">{claim}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Live SerpApi diligence */}
          <div className="border border-amber-glow/30 bg-amber-glow/5 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Radar className="w-4 h-4 text-amber-glow" />
              <h3 className="text-xs font-bold tracking-widest opacity-70">LIVE PRODUCT DILIGENCE</h3>
            </div>
            {isLoadingDiligence && <p className="text-xs opacity-60">Querying SerpApi market and news signals...</p>}
            {!isLoadingDiligence && diligence && (
              <>
                <div className="flex items-end gap-3 mb-4">
                  <span className="text-4xl font-bold text-amber-glow">{diligence.opportunityScore}</span>
                  <span className="text-xs tracking-widest opacity-60 mb-1">/ 100 {diligence.scoreLabel} SIGNAL</span>
                </div>
                <div className="grid md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="opacity-50 uppercase tracking-widest mb-2">Demand signals</p>
                    {diligence.demandSignals.map((signal, i) => <p key={i} className="opacity-75 mb-2">• {signal}</p>)}
                  </div>
                  <div>
                    <p className="opacity-50 uppercase tracking-widest mb-2">Competitor / industry signals</p>
                    {diligence.competitorSignals.map((signal, i) => <p key={i} className="opacity-75 mb-2">• {signal}</p>)}
                  </div>
                </div>
                {diligence.sources.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-technical-white/10">
                    <p className="opacity-50 uppercase tracking-widest mb-2">Cited sources</p>
                    <div className="flex flex-wrap gap-2">
                      {diligence.sources.map((source, i) => (
                        <a key={i} href={source.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 border border-technical-white/20 px-2 py-1 hover:border-amber-glow/60">
                          <ExternalLink className="w-3 h-3" /> {source.title.slice(0, 42)}{source.title.length > 42 ? '…' : ''}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                <p className="text-[10px] opacity-40 mt-4">Research support only. This score is not legal freedom-to-operate advice.</p>
              </>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-technical-white/20 flex justify-between items-center">
          <button
            onClick={onClose}
            className="px-6 py-2 text-xs tracking-widest border border-technical-white/30 hover:bg-technical-white/10 transition-colors"
          >
            CLOSE
          </button>

          {patent.isExpired && (
            <button
              onClick={onRemix}
              disabled={isRemixing}
              className="metal-plate px-8 py-3 text-xs tracking-widest flex items-center gap-2"
            >
              {isRemixing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  ANALYZING...
                </>
              ) : (
                <>
                  <FlaskConical className="w-4 h-4" />
                  INITIATE REMIX SEQUENCE
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
