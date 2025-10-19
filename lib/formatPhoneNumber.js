// utils/formatPhoneNumber.js

export function formatPhoneNumber(input) {
  if (!input || typeof input !== 'string') return '';

  // Remove spaces, dashes, parentheses, etc.
  const cleaned = input.replace(/[\s\-\(\)]/g, '');

  // Already starts with +27
  if (cleaned.startsWith('+27')) {
    return cleaned;
  }

  // Starts with 27 but missing '+'
  if (cleaned.startsWith('27')) {
    return `+${cleaned}`;
  }

  // Starts with 0 — replace with +27
  if (cleaned.startsWith('0')) {
    return `+27${cleaned.substring(1)}`;
  }

  // Otherwise return as is
  return cleaned;
}