import { X, FlaskConical, Loader2, Calendar, Users, FileText, Tag } from 'lucide-react';
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

interface PatentDetailModalProps {
  patent: PatentDetail;
  onClose: () => void;
  onRemix: () => void;
  isRemixing?: boolean;
}

export default function PatentDetailModal({
  patent,
  onClose,
  onRemix,
  isRemixing = false,
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
