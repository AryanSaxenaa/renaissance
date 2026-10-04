import type { Confidence, StatusEvent, StatusMember, StatusReport, Verdict } from '../../shared/types.js';
import {
  isClosingEvent,
  isFeeEvent,
  isRoutineTimelineEvent,
  mapCountryStatus,
  normaliseLegalStatus,
} from './vocab.js';
import type { PatentDetails, WorldwideApplication } from './types.js';

export type StatusInput = {
  details: PatentDetails;
  countryStatus?: Record<string, string>;
  now?: Date;
  evidence?: StatusReport['evidence'];
};

const STATIC_NOT_CHECKED = [
  'Jurisdictions not represented in the patent family',
  'Design patents and trade dress',
  'Term adjustments and patent term extensions',
  'Reinstatement or restoration after lapse',
  'Unpaid-fee grace periods',
  'Licences and assignments',
  'Data freshness beyond response metadata',
];

function addYears(isoDate: string, years: number): string {
  const d = new Date(isoDate);
  d.setUTCFullYear(d.getUTCFullYear() + years);
  return d.toISOString().slice(0, 10);
}

function parseDate(s?: string): string | null {
  if (!s) return null;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

function findOwnMember(details: PatentDetails): WorldwideApplication | undefined {
  const apps = details.worldwide_applications ?? [];
  const marked = apps.find((a) => a.this_app === true);
  if (marked) return marked;
  return apps[0];
}

function officeKey(app: WorldwideApplication): string {
  return (app.country_code ?? 'XX').toUpperCase();
}

function memberCategory(
  app: WorldwideApplication,
  countryStatus?: Record<string, string>,
): { cat: StatusMember['cat']; raw: string; unrecognised?: string } {
  const fromCat = normaliseLegalStatus(app.legal_status_cat ?? app.legal_status);
  if (fromCat.cat !== 'UNKNOWN') {
    return { cat: fromCat.cat, raw: app.legal_status_cat ?? app.legal_status ?? '', unrecognised: fromCat.unrecognised };
  }
  const office = officeKey(app);
  const cs = countryStatus?.[office] ?? countryStatus?.[office.toLowerCase()];
  const mapped = mapCountryStatus(cs);
  if (mapped) return { cat: mapped, raw: cs ?? '' };
  return { cat: 'UNKNOWN', raw: app.legal_status ?? app.legal_status_cat ?? '' };
}

function downgradeConfidence(c: Confidence): Confidence {
  if (c === 'HIGH') return 'MEDIUM';
  if (c === 'MEDIUM') return 'LOW';
  return c;
}

function downgradeVerdict(v: Verdict): Verdict {
  if (v === 'LIKELY_FREE') return 'UNCERTAIN';
  if (v === 'IN_FORCE') return 'UNCERTAIN';
  return v;
}

export function computeStatusReport(input: StatusInput): StatusReport {
  const now = input.now ?? new Date();
  const rulesFired: string[] = [];
  const unrecognised: string[] = [];
  const details = input.details;
  const own = findOwnMember(details);
  const evidence = input.evidence ?? [];

  const members: StatusMember[] = (details.worldwide_applications ?? []).map((app) => {
    const m = memberCategory(app, input.countryStatus);
    if (m.unrecognised) unrecognised.push(m.unrecognised);
    return {
      office: officeKey(app),
      appNo: app.application_number ?? '',
      cat: m.cat,
      raw: m.raw,
      thisApp: app.this_app === true || app === own,
    };
  });

  const events: StatusEvent[] = (details.legal_events ?? []).map((e) => {
    const code = e.code ?? '';
    const title = e.title ?? '';
    const recognised =
      isClosingEvent(code, title) || isFeeEvent(code, title) || isRoutineTimelineEvent(code, title);
    if (!recognised && (code || title)) unrecognised.push(code || title);
    return { code, title, date: e.date ?? '', recognised };
  });

  const filingDates: string[] = [];
  if (own?.filing_date) {
    const p = parseDate(own.filing_date);
    if (p) filingDates.push(p);
  }
  if (details.filing_date) {
    const p = parseDate(details.filing_date);
    if (p) filingDates.push(p);
  }
  for (const p of details.parent_applications ?? []) {
    const d = parseDate(p.filing_date);
    if (d) filingDates.push(d);
  }
  filingDates.sort();
  const earliestFiling = filingDates[0] ?? 'unknown';
  const endEstimate = earliestFiling !== 'unknown' ? addYears(earliestFiling, 20) : 'unknown';
  const termElapsed =
    earliestFiling !== 'unknown' && endEstimate !== 'unknown'
      ? now.toISOString().slice(0, 10) > endEstimate
      : false;

  const termEstimate = {
    earliestFiling,
    endEstimate,
    elapsed: termElapsed,
    caveat: 'Estimated 20-year term; adjustments and extensions not verified from retrieved data',
  };

  const ownOffice = own ? officeKey(own) : 'XX';
  let headline: Verdict = 'NOT_ENOUGH_DATA';
  let confidence: Confidence = null;

  if (!own) {
    rulesFired.push('R7');
    headline = 'NOT_ENOUGH_DATA';
  } else {
    const ownMeta = memberCategory(own, input.countryStatus);
    if (ownMeta.unrecognised) unrecognised.push(ownMeta.unrecognised);

    const officeMembers = members.filter((m) => m.office === ownOffice);

    if (ownMeta.cat === 'UNKNOWN') {
      rulesFired.push('R7');
      headline = 'NOT_ENOUGH_DATA';
    } else if (ownMeta.cat === 'ACTIVE') {
      rulesFired.push('R1');
      headline = 'IN_FORCE';
      confidence = 'HIGH';
    } else if (
      officeMembers.some((m) => !m.thisApp && (m.cat === 'ACTIVE' || m.cat === 'PENDING'))
    ) {
      rulesFired.push('R5');
      headline = 'RELATED_ACTIVE';
      confidence = 'HIGH';
    } else if (ownMeta.cat === 'NON_ACTIVE' && !termElapsed) {
      rulesFired.push('R4');
      headline = 'LAPSED_EARLY';
      confidence = 'MEDIUM';
    } else if (ownMeta.cat === 'NON_ACTIVE' && termElapsed) {
      const closing = events.some((e) => e.recognised && isClosingEvent(e.code, e.title));
      const cs = input.countryStatus?.[ownOffice] ?? input.countryStatus?.[ownOffice.toLowerCase()];
      const csNotActive = mapCountryStatus(cs) === 'NON_ACTIVE';
      if (closing || csNotActive) {
        rulesFired.push('R2');
        headline = 'LIKELY_FREE';
        confidence = 'HIGH';
      } else {
        rulesFired.push('R3');
        headline = 'LIKELY_FREE';
        confidence = 'MEDIUM';
      }
    } else if (ownMeta.cat === 'PENDING') {
      rulesFired.push('R5');
      headline = 'RELATED_ACTIVE';
      confidence = 'HIGH';
    }

    const feeAfterTerm = events.some((e) => {
      if (!isFeeEvent(e.code, e.title)) return false;
      if (!e.date || endEstimate === 'unknown') return false;
      return e.date > endEstimate;
    });
    const conflicting = events.some((e) => isClosingEvent(e.code, e.title) && ownMeta.cat === 'ACTIVE');
    if (feeAfterTerm || conflicting) {
      rulesFired.push('R6');
      headline = 'UNCERTAIN';
      confidence = 'LOW';
    }
  }

  if (unrecognised.length > 0) {
    rulesFired.push('R8');
    headline = downgradeVerdict(headline);
    confidence = downgradeConfidence(confidence);
  }

  if (headline === 'LIKELY_FREE' && confidence === 'HIGH' && unrecognised.length > 0) {
    confidence = 'MEDIUM';
  }

  const otherOffices: Record<string, Verdict> = {};
  const byOffice = new Map<string, StatusMember[]>();
  for (const m of members) {
    const list = byOffice.get(m.office) ?? [];
    list.push(m);
    byOffice.set(m.office, list);
  }
  for (const [office, list] of byOffice) {
    if (office === ownOffice) continue;
    if (list.some((m) => m.cat === 'ACTIVE')) otherOffices[office] = 'IN_FORCE';
    else if (list.some((m) => m.cat === 'PENDING')) otherOffices[office] = 'RELATED_ACTIVE';
    else if (list.every((m) => m.cat === 'NON_ACTIVE')) otherOffices[office] = 'LIKELY_FREE';
    else otherOffices[office] = 'UNCERTAIN';
  }

  return {
    ownOffice,
    headline,
    confidence,
    termEstimate,
    members,
    events,
    otherOffices,
    rulesFired,
    unrecognised: [...new Set(unrecognised)],
    notChecked: [...STATIC_NOT_CHECKED],
    evidence,
  };
}
