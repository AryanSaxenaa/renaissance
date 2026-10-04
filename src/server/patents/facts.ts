import type { Fact } from '../../shared/types.js';
import type { StatusReport } from '../../shared/types.js';
import { nextFactId, resetGlobalFactIds } from '../brief/factIds.js';
import type { PatentDetails } from './types.js';

export function resetFactCounter(): void {
  resetGlobalFactIds();
}

export function statusFacts(report: StatusReport): Fact[] {
  const src = report.evidence[0];
  const source = {
    callId: src?.callId ?? 'status-local',
    engine: 'google_patents_details',
    searchMetadataId: src?.searchMetadataId ?? null,
    path: src?.path ?? 'status',
  };
  const facts: Fact[] = [
    {
      id: nextFactId(),
      key: 'status.own.verdict',
      kind: 'status',
      text: `Own-office verdict: ${report.headline} (confidence: ${report.confidence ?? 'n/a'})`,
      value: report.headline,
      source,
    },
    {
      id: nextFactId(),
      key: 'status.own.office',
      kind: 'status',
      text: `Own office: ${report.ownOffice}`,
      value: report.ownOffice,
      source,
    },
    {
      id: nextFactId(),
      key: 'status.term.elapsed',
      kind: 'status',
      text: `Term estimate elapsed: ${report.termEstimate.elapsed}`,
      value: String(report.termEstimate.elapsed),
      source,
    },
  ];
  return facts;
}

export function patentTextFacts(
  details: PatentDetails,
  source: Fact['source'],
): Fact[] {
  const facts: Fact[] = [];
  if (details.title) {
    facts.push({
      id: nextFactId(),
      key: 'patent.title',
      kind: 'patent_text',
      text: details.title,
      source,
    });
  }
  if (details.abstract) {
    facts.push({
      id: nextFactId(),
      key: 'patent.abstract',
      kind: 'patent_text',
      text: details.abstract.slice(0, 500),
      source,
    });
  }
  const claim1 = details.claims?.[0];
  if (claim1) {
    facts.push({
      id: nextFactId(),
      key: 'patent.claim1',
      kind: 'patent_text',
      text: claim1.slice(0, 500),
      source,
    });
  }
  return facts;
}
