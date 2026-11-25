/**
 * UPI ID Validation and Helper Utilities
 * Standard NPCI UPI Virtual Payment Address (VPA) format:
 * [alphanumeric, dot, hyphen, underscore] @ [alphanumeric provider handle]
 * e.g. 9876543210@paytm, rajesh.sharma@okaxis, fixhub@icici
 */

export const POPULAR_UPI_HANDLES = [
  '@okaxis',
  '@oksbi',
  '@okhdfcbank',
  '@paytm',
  '@ybl',
  '@ibl',
  '@icici',
  '@apl',
  '@axl',
  '@barodampay',
];

/**
 * Validates a UPI Virtual Payment Address (VPA)
 * @param {string} upiId
 * @returns {{ isValid: boolean, error: string | null, normalized: string }}
 */
export function validateUpiId(upiId) {
  if (!upiId || typeof upiId !== 'string') {
    return {
      isValid: false,
      error: 'Please enter a UPI ID (e.g. 9876543210@paytm or name@okaxis)',
      normalized: '',
    };
  }

  const clean = upiId.trim().toLowerCase();

  if (clean.length === 0) {
    return {
      isValid: false,
      error: 'UPI ID cannot be blank',
      normalized: '',
    };
  }

  if (/\s/.test(clean)) {
    return {
      isValid: false,
      error: 'UPI ID cannot contain spaces',
      normalized: clean,
    };
  }

  const parts = clean.split('@');
  if (parts.length !== 2) {
    return {
      isValid: false,
      error: 'UPI ID must contain exactly one "@" symbol (e.g. phone@bank)',
      normalized: clean,
    };
  }

  const [username, handle] = parts;

  if (username.length < 2 || username.length > 50) {
    return {
      isValid: false,
      error: 'Username part before "@" must be between 2 and 50 characters',
      normalized: clean,
    };
  }

  // Username: alphanumeric, dot, hyphen, underscore
  if (!/^[a-z0-9.\-_]+$/.test(username)) {
    return {
      isValid: false,
      error: 'Username can only contain letters, numbers, dots (.), hyphens (-), and underscores (_)',
      normalized: clean,
    };
  }

  // Handle: must start with letter/number, at least 2 chars, letters/numbers
  if (handle.length < 2 || handle.length > 30) {
    return {
      isValid: false,
      error: 'Bank/Provider handle after "@" must be 2 to 30 characters',
      normalized: clean,
    };
  }

  if (!/^[a-z0-9]+$/.test(handle)) {
    return {
      isValid: false,
      error: 'Bank handle after "@" can only contain letters and numbers (e.g. okaxis, paytm)',
      normalized: clean,
    };
  }

  // Strict regex check
  const strictUpiRegex = /^[a-z0-9.\-_]{2,50}@[a-z0-9]{2,30}$/;
  if (!strictUpiRegex.test(clean)) {
    return {
      isValid: false,
      error: 'Invalid UPI format. Example: 9876543210@paytm or shop@icici',
      normalized: clean,
    };
  }

  return {
    isValid: true,
    error: null,
    normalized: clean,
  };
}
