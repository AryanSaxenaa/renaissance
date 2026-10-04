import type { Fact } from '../../shared/types.js';
import type { StatusReport } from '../../shared/types.js';
import { resetGlobalFactIds } from './factIds.js';
import { patentTextFacts, statusFacts } from '../patents/facts.js';
import type { PatentDetails } from '../patents/types.js';

export function assembleFacts(input: {
  statusReport: StatusReport;
  details: PatentDetails;
  detailsSource: Fact['source'];
  market: Fact[];
  makers: Fact[];
  papers: Fact[];
  news: Fact[];
}): Fact[] {
  resetGlobalFactIds();
  return [
    ...statusFacts(input.statusReport),
    ...patentTextFacts(input.details, input.detailsSource),
    ...input.market,
    ...input.makers,
    ...input.papers,
    ...input.news,
  ];
}
