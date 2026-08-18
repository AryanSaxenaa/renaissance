import { cn } from '@/client/lib/utils';

export interface Patent {
  patentId: string;
  title: string;
  abstract: string;
  filingYear: number;
  expiryYear: number;
  isExpired: boolean;
  division: string;
  inventors: string[];
  claims?: string[];
  pdfUrl?: string;
  thumbnailUrl?: string;
}

interface PatentCardProps {
  patent: Patent;
  onClick?: () => void;
  isSelected?: boolean;
  variant?: 'full' | 'compact';
}

export default function PatentCard({
  patent,
  onClick,
  isSelected = false,
  variant = 'full',
}: PatentCardProps) {
  if (variant === 'compact') {
    return (
      <div
        onClick={onClick}
        className={cn(
          'min-w-[280px] h-full index-card p-4 flex flex-col cursor-pointer transition-transform hover:translate-y-[-2px]',
          isSelected && 'ring-2 ring-amber-glow'
        )}
      >
        <div className="flex justify-between items-start border-b border-black/10 pb-2 mb-2">
          <span className="text-[9px] font-bold tracking-tighter">REF: {patent.patentId}</span>
          <span
            className={cn(
              'text-[9px] font-bold px-1 uppercase',
              patent.isExpired ? 'bg-red-800 text-white' : 'bg-blue-800 text-white'
            )}
          >
            {patent.isExpired ? 'EXPIRED' : 'ACTIVE'}
          </span>
        </div>
        <h4 className="text-sm font-bold leading-tight flex-1">{patent.title}</h4>
        <div className="flex justify-between text-[9px] font-bold opacity-60 mt-2">
          <span>FILED: {patent.filingYear}</span>
          <span>DIV: {patent.division}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        'border border-technical-white/20 bg-cyanotype-dark/80 p-6 cursor-pointer transition-all hover:border-technical-white/40',
        isSelected && 'ring-2 ring-amber-glow border-amber-glow/50'
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-[10px] opacity-50 tracking-widest">REF: {patent.patentId}</span>
          <h3 className="text-lg font-bold mt-1">{patent.title}</h3>
        </div>
        <span
          className={cn(
            'text-[10px] font-bold px-2 py-1 uppercase',
            patent.isExpired ? 'bg-red-900/50 text-red-300' : 'bg-blue-900/50 text-blue-300'
          )}
        >
          {patent.isExpired ? 'EXPIRED' : 'ACTIVE'}
        </span>
      </div>

      <p className="text-sm opacity-70 mb-4 line-clamp-2">{patent.abstract}</p>

      <div className="grid grid-cols-3 gap-4 text-[10px]">
        <div>
          <p className="opacity-40 uppercase">Filed</p>
          <p className="font-bold">{patent.filingYear}</p>
        </div>
        <div>
          <p className="opacity-40 uppercase">Expiry</p>
          <p className={cn('font-bold', patent.isExpired && 'text-amber-glow')}>
            {patent.expiryYear}
          </p>
        </div>
        <div>
          <p className="opacity-40 uppercase">Division</p>
          <p className="font-bold">{patent.division}</p>
        </div>
      </div>

      {patent.inventors.length > 0 && (
        <div className="mt-4 pt-4 border-t border-technical-white/10">
          <p className="text-[10px] opacity-40 uppercase mb-1">Inventors</p>
          <p className="text-xs">{patent.inventors.join(', ')}</p>
        </div>
      )}
    </div>
  );
}
