import { describe, expect, it } from 'vitest';
import {
  cardDigits,
  detectCardBrand,
  formatCardNumber,
  formatExpiration,
  isValidCardNumber,
  isValidExpiration,
} from './card';

describe('card utilities', () => {
  it('normalizes and formats card numbers', () => {
    expect(cardDigits('4111-1111 1111 1111x')).toBe('4111111111111111');
    expect(formatCardNumber('4111111111111111')).toBe('4111 1111 1111 1111');
  });

  it('detects Visa and Mastercard ranges', () => {
    expect(detectCardBrand('4111111111111111')).toBe('Visa');
    expect(detectCardBrand('5555555555554444')).toBe('Mastercard');
    expect(detectCardBrand('6011111111111117')).toBe('');
  });

  it('validates card numbers with Luhn', () => {
    expect(isValidCardNumber('4111111111111111')).toBe(true);
    expect(isValidCardNumber('4111111111111112')).toBe(false);
  });

  it('formats and validates expiration dates', () => {
    expect(formatExpiration('1231')).toBe('12/31');
    expect(isValidExpiration('12/31', new Date(2031, 0, 1))).toBe(true);
    expect(isValidExpiration('01/30', new Date(2030, 1, 1))).toBe(false);
    expect(isValidExpiration('13/30')).toBe(false);
  });
});