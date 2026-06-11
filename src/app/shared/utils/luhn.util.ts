/**
 * Luhn checksum validation for card numbers.
 *
 * Pure and dependency-free so it can back both the card-input control's
 * `validate()` and a focused unit test. Non-digits are ignored; anything
 * shorter than 12 digits is rejected as not a plausible card number.
 */
export function isValidLuhn(input: string): boolean {
  const digits = (input ?? '').replace(/\D/g, '');
  if (digits.length < 12) {
    return false;
  }

  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let value = digits.charCodeAt(i) - 48; // '0' = 48
    if (double) {
      value *= 2;
      if (value > 9) {
        value -= 9;
      }
    }
    sum += value;
    double = !double;
  }
  return sum % 10 === 0;
}
