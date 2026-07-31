/**
 * Government ID input rules, shared by every form that collects them.
 *
 * Aadhaar — exactly 12 digits. Stored/displayed grouped as "1234 5678 9012";
 *           the grouping spaces are presentation only, never counted.
 * PAN     — exactly 10 characters, format AAAAA9999A (5 letters, 4 digits, 1 letter).
 */

export const AADHAAR_DIGITS = 12;
export const PAN_LENGTH = 10;

/** Digits only, capped at 12 — use this for validation and for sending to the API. */
export function aadhaarDigits(value) {
  return String(value || "").replace(/\D/g, "").slice(0, AADHAAR_DIGITS);
}

/** Caps at 12 digits and regroups as "1234 5678 9012" for display. */
export function formatAadhaar(value) {
  const digits = aadhaarDigits(value);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

export function isValidAadhaar(value) {
  return aadhaarDigits(value).length === AADHAAR_DIGITS;
}

/** Uppercase alphanumeric, capped at 10 characters. */
export function formatPan(value) {
  return String(value || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, PAN_LENGTH);
}

export function isValidPan(value) {
  return /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(formatPan(value));
}
