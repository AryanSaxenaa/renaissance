import type { DesignBrief, Fact } from '@/shared/types';
import FactCitation from './FactCitation';

type Props = {
  brief: DesignBrief;
  facts: Fact[];
  printable?: boolean;
};

function ClaimBlock({ title, claims }: { title: string; claims: DesignBrief['summary'] }) {
  if (!claims.length) return null;
  return (
    <section className="mb-6">
      <h3 className="text-xs font-bold tracking-[0.2em] uppercase border-b border-technical-white/20 pb-1 mb-2">
        {title}
      </h3>
      <ul className="space-y-2 text-sm leading-relaxed">
        {claims.map((c, i) => (
          <li key={`${title}-${i}`}>
            {c.text}
            <FactCitation factIds={c.factIds} />
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function BriefSheet({ brief, facts, printable }: Props) {
  return (
    <article
      className={`spec-sheet bg-cyanotype-dark/90 border border-technical-white/20 p-8 text-technical-white ${printable ? 'print:bg-white print:text-black print:border-black' : ''}`}
    >
      <header className="mb-6">
        <p className="text-[10px] font-mono uppercase tracking-widest opacity-60">Design brief · design_brief/1</p>
        <p className="mt-2 text-sm border-l-2 border-emerald-400/50 pl-3 italic">{brief.statusLine}</p>
      </header>

      <ClaimBlock title="Summary" claims={brief.summary} />
      <ClaimBlock title="Mechanism" claims={brief.mechanism} />
      <ClaimBlock title="Market reality" claims={brief.marketReality} />
      <ClaimBlock title="Risks & limits" claims={brief.risks} />

      {brief.suggestions.length > 0 && (
        <section className="mb-6 border border-dashed border-amber-400/40 p-4">
          <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-amber-200 mb-2">
            Unverified suggestions
          </h3>
          <ul className="space-y-3 text-sm">
            {brief.suggestions.map((s) => (
              <li key={s.title}>
                <strong>{s.title}</strong> ({s.component}): {s.direction}
                <FactCitation factIds={s.factIds} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {brief.nextSteps.length > 0 && (
        <section className="mb-6">
          <h3 className="text-xs font-bold tracking-[0.2em] uppercase border-b border-technical-white/20 pb-1 mb-2">
            Next steps
          </h3>
          <ol className="list-decimal list-inside text-sm space-y-1">
            {brief.nextSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>
      )}

      <footer className="mt-8 pt-4 border-t border-technical-white/10 text-[10px] font-mono opacity-70">
        <p>Footnotes: {facts.length} source facts on file. Verifier removed {brief.removedByVerifier} claim(s).</p>
        {printable && (
          <ul className="mt-2 columns-2 gap-4">
            {facts.slice(0, 12).map((f) => (
              <li key={f.id}>
                [{f.id}] {f.text.slice(0, 120)}
                {f.source.searchMetadataId ? ` · receipt ${f.source.searchMetadataId}` : ''}
              </li>
            ))}
          </ul>
        )}
        {!printable && (
          <p className="mt-1">Receipt ids: {[...new Set(facts.map((f) => f.source.searchMetadataId).filter(Boolean))].join(', ')}</p>
        )}
      </footer>
    </article>
  );
}
