// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { formatCOP } from './format';

describe('formatCOP', () => {
  it('formats positive integer in COP', () => {
    const result = formatCOP(10000);
    expect(result).toContain('10');
    expect(result).toContain('000');
    // Should contain COP currency symbol or $ sign
    expect(result).toMatch(/\$|COP/);
  });

  it('formats zero as COP', () => {
    const result = formatCOP(0);
    expect(result).toContain('0');
  });

  it('formats large amounts without explicit decimal cents', () => {
    // es-CO locale uses "." as thousands separator (e.g. "$ 50.000")
    // and "," as decimal separator — with minimumFractionDigits:0
    // there should be no comma-decimal part like ",00"
    const result = formatCOP(50000);
    expect(result).not.toMatch(/,\d{2}$/);
  });

  it('formats negative values', () => {
    const result = formatCOP(-5000);
    expect(result).toContain('5');
  });

  it('returns a string', () => {
    expect(typeof formatCOP(1234)).toBe('string');
  });
});
