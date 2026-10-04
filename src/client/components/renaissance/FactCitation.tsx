import { cn } from '@/client/lib/utils';

type Props = {
  factIds: string[];
  className?: string;
};

export default function FactCitation({ factIds, className }: Props) {
  if (!factIds.length) return null;
  return (
    <span className={cn('inline-flex flex-wrap gap-1 ml-1', className)}>
      {factIds.map((id) => (
        <span
          key={id}
          className="text-[10px] font-mono px-1 py-0.5 border border-technical-white/30 text-technical-white/70"
          title={`Source fact ${id}`}
        >
          [{id}]
        </span>
      ))}
    </span>
  );
}
