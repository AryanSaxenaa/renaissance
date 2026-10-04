import type { PatentDetails } from '../src/server/patents/types.js';

/** Naive baseline: filing date + 20 years before `now` ⇒ treat as "free by date". */
export function naiveExpiredByTerm(details: PatentDetails, now = new Date()): boolean {
  const filing =
    details.filing_date ??
    details.worldwide_applications?.find((a) => a.this_app)?.filing_date ??
    details.worldwide_applications?.[0]?.filing_date;
  if (!filing) return false;
  const end = new Date(filing);
  end.setUTCFullYear(end.getUTCFullYear() + 20);
  return now > end;
}
