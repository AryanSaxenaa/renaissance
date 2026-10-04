import { describe, expect, it } from 'vitest';
import { computeStatusReport } from '../src/server/patents/status.js';
import type { PatentDetails } from '../src/server/patents/types.js';

function d(partial: Partial<PatentDetails> & { patent_id: string }): PatentDetails {
  return {
    worldwide_applications: [],
    parent_applications: [],
    legal_events: [],
    synthetic: true,
    ...partial,
  };
}

function own(
  cat: string,
  filing = '1970-01-01',
  office = 'US',
): PatentDetails {
  return d({
    patent_id: 'T',
    filing_date: filing,
    worldwide_applications: [
      {
        country_code: office,
        application_number: 'APP1',
        filing_date: filing,
        legal_status_cat: cat,
        this_app: true,
      },
    ],
  });
}

const NOW = new Date('2026-06-01');

describe('patents/status computeStatusReport', () => {
  it('R1: own ACTIVE → IN_FORCE HIGH', () => {
    const r = computeStatusReport({ details: own('active', '2015-01-01'), now: NOW });
    expect(r.headline).toBe('IN_FORCE');
    expect(r.confidence).toBe('HIGH');
    expect(r.rulesFired).toContain('R1');
  });

  it('R2: NON_ACTIVE term elapsed with closing event → LIKELY_FREE HIGH', () => {
    const details = own('not active', '1970-01-01');
    details.legal_events = [{ code: 'EXP', title: 'Expired', date: '1995-01-01' }];
    const r = computeStatusReport({ details, now: NOW });
    expect(r.headline).toBe('LIKELY_FREE');
    expect(r.confidence).toBe('HIGH');
    expect(r.rulesFired).toContain('R2');
  });

  it('R2 via country_status NOT_ACTIVE', () => {
    const details = own('unknown', '1970-01-01');
    details.worldwide_applications![0].legal_status_cat = undefined;
    const r = computeStatusReport({
      details,
      countryStatus: { US: 'NOT_ACTIVE' },
      now: NOW,
    });
    expect(['LIKELY_FREE', 'NOT_ENOUGH_DATA']).toContain(r.headline);
  });

  it('R3: NON_ACTIVE term elapsed without event → LIKELY_FREE MEDIUM', () => {
    const r = computeStatusReport({ details: own('not active', '1970-01-01'), now: NOW });
    expect(r.headline).toBe('LIKELY_FREE');
    expect(r.confidence).toBe('MEDIUM');
    expect(r.rulesFired).toContain('R3');
  });

  it('R4: NON_ACTIVE before term end → LAPSED_EARLY', () => {
    const r = computeStatusReport({ details: own('not active', '2015-01-01'), now: NOW });
    expect(r.headline).toBe('LAPSED_EARLY');
    expect(r.rulesFired).toContain('R4');
  });

  it('R5: sibling ACTIVE in same office → RELATED_ACTIVE', () => {
    const details = d({
      patent_id: 'R5',
      filing_date: '1970-01-01',
      worldwide_applications: [
        {
          country_code: 'US',
          application_number: 'PARENT',
          filing_date: '1970-01-01',
          legal_status_cat: 'not active',
          this_app: true,
        },
        {
          country_code: 'US',
          application_number: 'CHILD',
          filing_date: '1990-01-01',
          legal_status_cat: 'active',
          this_app: false,
        },
      ],
    });
    const r = computeStatusReport({ details, now: NOW });
    expect(r.headline).toBe('RELATED_ACTIVE');
    expect(r.rulesFired).toContain('R5');
  });

  it('R6: fee event after term → UNCERTAIN', () => {
    const details = own('not active', '1970-01-01');
    details.legal_events = [{ code: 'FEE', title: 'Maintenance fee paid', date: '2020-01-01' }];
    const r = computeStatusReport({ details, now: NOW });
    expect(r.headline).toBe('UNCERTAIN');
    expect(r.rulesFired).toContain('R6');
  });

  it('R7: missing own member → NOT_ENOUGH_DATA', () => {
    const r = computeStatusReport({
      details: d({ patent_id: 'empty' }),
      now: NOW,
    });
    expect(r.headline).toBe('NOT_ENOUGH_DATA');
    expect(r.rulesFired).toContain('R7');
  });

  it('R8: unrecognised status downgrades', () => {
    const details = own('active', '2010-01-01');
    details.legal_events = [{ code: 'ZZZ_UNKNOWN', title: 'Mystery event', date: '2020-01-01' }];
    const r = computeStatusReport({ details, now: NOW });
    expect(r.rulesFired).toContain('R8');
    expect(r.unrecognised.length).toBeGreaterThan(0);
  });

  it('never LIKELY_FREE HIGH when ACTIVE member in own office', () => {
    const details = d({
      patent_id: 'prop1',
      filing_date: '1970-01-01',
      worldwide_applications: [
        { country_code: 'US', application_number: 'A', filing_date: '1970-01-01', legal_status_cat: 'active', this_app: true },
      ],
      legal_events: [{ code: 'EXP', title: 'Expired', date: '1995-01-01' }],
    });
    const r = computeStatusReport({ details, now: NOW });
    expect(r.headline).not.toBe('LIKELY_FREE');
  });

  it('never boolean expired field in report', () => {
    const r = computeStatusReport({ details: own('not active', '1970-01-01'), now: NOW });
    expect(JSON.stringify(r)).not.toMatch(/"expired"\s*:\s*true/i);
  });

  it('term estimate marks elapsed for old filing', () => {
    const r = computeStatusReport({ details: own('not active', '1970-01-01'), now: NOW });
    expect(r.termEstimate.elapsed).toBe(true);
  });

  it('otherOffices lists EP IN_FORCE when EP active', () => {
    const details = d({
      patent_id: 'EP',
      worldwide_applications: [
        { country_code: 'US', application_number: '1', filing_date: '1970-01-01', legal_status_cat: 'not active', this_app: true },
        { country_code: 'EP', application_number: '2', filing_date: '1980-01-01', legal_status_cat: 'active', this_app: false },
      ],
    });
    const r = computeStatusReport({ details, now: NOW });
    expect(r.otherOffices.EP).toBe('IN_FORCE');
  });

  it('PENDING own triggers RELATED_ACTIVE', () => {
    const r = computeStatusReport({ details: own('pending', '2020-01-01'), now: NOW });
    expect(r.headline).toBe('RELATED_ACTIVE');
  });

  it('parent filing pulls earliest term', () => {
    const details = d({
      patent_id: 'parent',
      filing_date: '1980-01-01',
      parent_applications: [{ filing_date: '1960-01-01' }],
      worldwide_applications: [
        { country_code: 'US', application_number: '1', filing_date: '1980-01-01', legal_status_cat: 'not active', this_app: true },
      ],
    });
    const r = computeStatusReport({ details, now: NOW });
    expect(r.termEstimate.earliestFiling).toBe('1960-01-01');
  });

  it('notChecked includes static caveats', () => {
    const r = computeStatusReport({ details: own('active'), now: NOW });
    expect(r.notChecked.length).toBeGreaterThan(3);
  });

  it('members include thisApp flag', () => {
    const r = computeStatusReport({ details: own('active'), now: NOW });
    expect(r.members.some((m) => m.thisApp)).toBe(true);
  });

  it('ACTIVE Pending sibling blocks free verdict', () => {
    const details = d({
      patent_id: 'sib',
      worldwide_applications: [
        { country_code: 'US', application_number: '1', filing_date: '1970-01-01', legal_status_cat: 'not active', this_app: true },
        { country_code: 'US', application_number: '2', filing_date: '2020-01-01', legal_status_cat: 'pending', this_app: false },
      ],
    });
    const r = computeStatusReport({ details, now: NOW });
    expect(r.headline).toBe('RELATED_ACTIVE');
  });

  it('conflicting closing vs active triggers R6', () => {
    const details = own('active', '2010-01-01');
    details.legal_events = [{ code: 'EXP', title: 'Expired', date: '2025-01-01' }];
    const r = computeStatusReport({ details, now: NOW });
    expect(r.rulesFired).toContain('R6');
  });

  it('UNKNOWN own without details → NOT_ENOUGH_DATA', () => {
    const details = own('', '1970-01-01');
    details.worldwide_applications![0].legal_status_cat = 'mystery-value';
    const r = computeStatusReport({ details, now: NOW });
    expect(r.headline).toBe('NOT_ENOUGH_DATA');
  });

  it('NON_ACTIVE recent filing not LIKELY_FREE HIGH without R2 signals', () => {
    const r = computeStatusReport({ details: own('not active', '2018-01-01'), now: NOW });
    if (r.headline === 'LIKELY_FREE') expect(r.confidence).not.toBe('HIGH');
  });

  it('recognised lapsed title counts as closing', () => {
    const details = own('not active', '1970-01-01');
    details.legal_events = [{ code: 'X', title: 'Patent lapsed', date: '1995-01-01' }];
    const r = computeStatusReport({ details, now: NOW });
    expect(r.rulesFired).toContain('R2');
  });

  it('property: unseen vocab never LIKELY_FREE HIGH', () => {
    for (const raw of ['WeirdStatus', 'UnknownState', '???']) {
      const details = own(raw, '1970-01-01');
      details.legal_events = [{ code: 'EXP', title: 'Expired', date: '1995-01-01' }];
      const r = computeStatusReport({ details, now: NOW });
      if (r.headline === 'LIKELY_FREE') expect(r.confidence).not.toBe('HIGH');
    }
  });

  it('property: ACTIVE own office blocks LIKELY_FREE', () => {
    const details = d({
      patent_id: 'p',
      worldwide_applications: [
        { country_code: 'US', application_number: '1', filing_date: '1970-01-01', legal_status_cat: 'active', this_app: true },
      ],
    });
    const r = computeStatusReport({ details, now: NOW });
    expect(r.headline).not.toBe('LIKELY_FREE');
  });

  it('property: PENDING in office blocks LIKELY_FREE', () => {
    const details = d({
      patent_id: 'p2',
      worldwide_applications: [
        { country_code: 'US', application_number: '1', filing_date: '1970-01-01', legal_status_cat: 'pending', this_app: true },
      ],
    });
    const r = computeStatusReport({ details, now: NOW });
    expect(r.headline).not.toBe('LIKELY_FREE');
  });

  it('fixture R1 case from synthetic json shape', () => {
    const details = own('active', '2010-01-01');
    details.synthetic = true;
    const r = computeStatusReport({ details, now: NOW });
    expect(r.headline).toBe('IN_FORCE');
  });
});
