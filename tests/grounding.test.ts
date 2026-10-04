import { describe, expect, it } from 'vitest';
import { numbersIn, numeralsGroundedInFacts } from '../src/server/brief/grounding.js';

describe('numbersIn', () => {
  it('extracts and normalises numerals', () => {
    expect(numbersIn('There are 1,200 units')).toContain('1200');
  });

  it('ignores fact id tokens', () => {
    expect(numbersIn('See [F12] for 500 items')).toEqual(['500']);
  });

  it('strips currency symbols', () => {
    expect(numbersIn('Price ₹890')).toContain('890');
  });
});

describe('numeralsGroundedInFacts', () => {
  it('rejects invented numerals not in facts', () => {
    const ok = numeralsGroundedInFacts('Torque rating 999 Nm', [{ text: 'Rated for 120 Nm operation' }]);
    expect(ok).toBe(false);
  });

  it('accepts numerals present in cited facts', () => {
    const ok = numeralsGroundedInFacts('Median price 1200', [{ text: 'Median extracted price: 1200', value: 1200 }]);
    expect(ok).toBe(true);
  });

  it('allows claims without numerals', () => {
    expect(numeralsGroundedInFacts('Governor regulates speed', [{ text: 'Mechanical governor' }])).toBe(true);
  });
});
