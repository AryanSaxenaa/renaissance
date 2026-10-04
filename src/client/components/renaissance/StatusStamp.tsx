import { cn } from '@/client/lib/utils';
import type { Confidence, Verdict } from '@/shared/types';

const LABELS: Record<Verdict, string> = {
  LIKELY_FREE: 'Likely free',
  IN_FORCE: 'In force',
  LAPSED_EARLY: 'Lapsed early',
  RELATED_ACTIVE: 'Related active',
  UNCERTAIN: 'Uncertain',
  NOT_ENOUGH_DATA: 'Insufficient data',
};

type Props = {
  verdict: Verdict;
  confidence: Confidence;
  office?: string;
  className?: string;
};

export default function StatusStamp({ verdict, confidence, office, className }: Props) {
  const tone =
    verdict === 'LIKELY_FREE'
      ? 'border-emerald-400/60 text-emerald-200'
      : verdict === 'IN_FORCE' || verdict === 'RELATED_ACTIVE'
        ? 'border-amber-400/70 text-amber-100'
        : 'border-technical-white/40 text-technical-white/80';

  return (
    <div
      className={cn(
        'inline-flex flex-col border-2 border-dashed px-4 py-2 font-mono uppercase tracking-widest rotate-[-2deg] bg-cyanotype-dark/80',
        tone,
        className,
      )}
      aria-label={`Status ${LABELS[verdict]}`}
    >
      <span className="text-[10px] opacity-70">Evidence-based · Not legal advice</span>
      <span className="text-sm font-bold">{LABELS[verdict]}</span>
      {office ? <span className="text-[10px] normal-case tracking-normal opacity-80">{office}</span> : null}
      {confidence ? <span className="text-[9px] opacity-60">Confidence: {confidence}</span> : null}
    </div>
  );
}
