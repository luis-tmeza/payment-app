export type CardBrand = 'Visa' | 'Mastercard' | '';

export const cardDigits = (value: string): string => value.replace(/\D/g, '').slice(0, 16);

export const formatCardNumber = (value: string): string =>
  cardDigits(value).replace(/(.{4})/g, '$1 ').trim();

export const detectCardBrand = (value: string): CardBrand => {
  const digits = cardDigits(value);
  if (/^4/.test(digits)) return 'Visa';
  if (/^(5[1-5]|2(2[2-9]|[3-6][0-9]|7[01]))/.test(digits)) return 'Mastercard';
  return '';
};

export const formatExpiration = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
};

export const isValidCardNumber = (value: string): boolean => {
  const digits = cardDigits(value);
  let sum = 0;
  let shouldDouble = false;

  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = Number(digits[index]);
    if (shouldDouble) digit = digit > 4 ? digit * 2 - 9 : digit * 2;
    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return digits.length >= 13 && sum % 10 === 0;
};

export const isValidExpiration = (value: string, today = new Date()): boolean => {
  const match = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(value);
  if (!match) return false;

  const expiration = new Date(2000 + Number(match[2]), Number(match[1]), 0, 23, 59, 59);
  return expiration >= today;
};