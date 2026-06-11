import { isValidLuhn } from './luhn.util';

describe('isValidLuhn', () => {
  it('accepts a valid Visa test number', () => {
    expect(isValidLuhn('4242424242424242')).toBe(true);
  });

  it('accepts a valid Mastercard test number', () => {
    expect(isValidLuhn('5555555555554444')).toBe(true);
  });

  it('ignores spaces between digit groups', () => {
    expect(isValidLuhn('4242 4242 4242 4242')).toBe(true);
  });

  it('rejects a number that fails the checksum', () => {
    expect(isValidLuhn('4242424242424241')).toBe(false);
  });

  it('rejects input that is too short to be a card', () => {
    expect(isValidLuhn('1234')).toBe(false);
  });

  it('rejects empty / nullish input', () => {
    expect(isValidLuhn('')).toBe(false);
    expect(isValidLuhn(undefined as unknown as string)).toBe(false);
  });
});
