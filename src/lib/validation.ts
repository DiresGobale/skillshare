// Shared validation utilities — used by both frontend and backend.
// Keeping these in one place ensures consistent validation rules everywhere.

export interface ValidationResult {
  ok: boolean;
  error?: string;
}

// Name fields: letters (any language), spaces, hyphens, apostrophes, periods.
// Rejects numbers and other special characters.
// Allows unicode letters so it works for African, Asian, European names etc.
export function validateName(name: string, fieldName = "Name"): ValidationResult {
  const trimmed = name.trim();
  if (!trimmed) return { ok: false, error: `${fieldName} is required.` };
  if (trimmed.length < 2) return { ok: false, error: `${fieldName} must be at least 2 characters.` };
  if (trimmed.length > 80) return { ok: false, error: `${fieldName} must be at most 80 characters.` };
  // Allow letters (including accented/unicode), spaces, hyphens, apostrophes, periods
  // \p{L} = any unicode letter, \p{M} = combining marks (accents)
  if (!/^[\p{L}\p{M}\s'.-]+$/u.test(trimmed)) {
    return { ok: false, error: `${fieldName} can only contain letters, spaces, hyphens, and apostrophes. Numbers and special characters are not allowed.` };
  }
  return { ok: true };
}

// Email validation — standard RFC-compatible pattern
export function validateEmail(email: string): ValidationResult {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed) return { ok: false, error: "Email is required." };
  if (trimmed.length > 254) return { ok: false, error: "Email is too long." };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmed)) {
    return { ok: false, error: "Please enter a valid email address." };
  }
  return { ok: true };
}

// Password validation
export function validatePassword(password: string): ValidationResult {
  if (!password) return { ok: false, error: "Password is required." };
  if (password.length < 8) return { ok: false, error: "Password must be at least 8 characters." };
  if (password.length > 128) return { ok: false, error: "Password is too long." };
  return { ok: true };
}

// Number validation — integers only, optionally with min/max
export function validateNumber(
  value: string | number,
  fieldName: string,
  opts?: { min?: number; max?: number; required?: boolean }
): ValidationResult {
  const { min, max, required = true } = opts ?? {};
  const str = String(value).trim();
  if (!str) {
    if (required) return { ok: false, error: `${fieldName} is required.` };
    return { ok: true };
  }
  // Only digits allowed (optionally a leading minus for negatives)
  if (!/^-?\d+$/.test(str)) {
    return { ok: false, error: `${fieldName} must be a valid number (digits only).` };
  }
  const num = parseInt(str, 10);
  if (isNaN(num)) return { ok: false, error: `${fieldName} must be a valid number.` };
  if (min !== undefined && num < min) return { ok: false, error: `${fieldName} must be at least ${min}.` };
  if (max !== undefined && num > max) return { ok: false, error: `${fieldName} must be at most ${max}.` };
  return { ok: true };
}

// Required text field
export function validateRequired(value: string, fieldName: string, opts?: { minLength?: number; maxLength?: number }): ValidationResult {
  const trimmed = value.trim();
  if (!trimmed) return { ok: false, error: `${fieldName} is required.` };
  const min = opts?.minLength ?? 1;
  if (trimmed.length < min) return { ok: false, error: `${fieldName} must be at least ${min} characters.` };
  if (opts?.maxLength && trimmed.length > opts.maxLength) return { ok: false, error: `${fieldName} must be at most ${opts.maxLength} characters.` };
  return { ok: true };
}

// Job title — letters, numbers, spaces, hyphens, slashes, parentheses, #, +
export function validateJobTitle(title: string): ValidationResult {
  const trimmed = title.trim();
  if (!trimmed) return { ok: false, error: "Job title is required." };
  if (trimmed.length < 3) return { ok: false, error: "Job title must be at least 3 characters." };
  if (trimmed.length > 120) return { ok: false, error: "Job title must be at most 120 characters." };
  // Allow letters, numbers, spaces, and common job-title punctuation
  if (!/^[\p{L}\p{M}\p{N}\s/().\-&#,+]+$/u.test(trimmed)) {
    return { ok: false, error: "Job title contains invalid characters." };
  }
  return { ok: true };
}

// Location — letters, spaces, commas, hyphens, periods
export function validateLocation(location: string): ValidationResult {
  const trimmed = location.trim();
  if (!trimmed) return { ok: false, error: "Location is required." };
  if (trimmed.length > 120) return { ok: false, error: "Location is too long." };
  // Allow letters, spaces, commas, hyphens, periods, parentheses
  if (!/^[\p{L}\p{M}\s,.\-()]+$/u.test(trimmed)) {
    return { ok: false, error: "Location can only contain letters, spaces, commas, and hyphens." };
  }
  return { ok: true };
}

// Expiration duration validation — must be a positive number
export function validateExpirationDuration(durationDays: string | number): ValidationResult {
  const str = String(durationDays).trim();
  if (!str) return { ok: false, error: "Expiration duration is required." };
  if (!/^\d+$/.test(str)) return { ok: false, error: "Expiration duration must be a whole number." };
  const days = parseInt(str, 10);
  if (days < 1) return { ok: false, error: "Expiration duration must be at least 1 day." };
  if (days > 365) return { ok: false, error: "Expiration duration cannot exceed 365 days." };
  return { ok: true };
}

// Sanitize a name field — strip numbers and special characters, keep only letters/spaces/hyphens/apostrophes
export function sanitizeName(name: string): string {
  return name.replace(/[^\p{L}\p{M}\s'.-]/gu, "").trim();
}

// Sanitize a number field — strip non-digits
export function sanitizeNumber(value: string): string {
  return value.replace(/[^\d]/g, "");
}

// ============================================================
// ETHIOPIAN PHONE NUMBER VALIDATION
// ============================================================
// Ethiopian phone numbers follow these formats:
//   - Mobile: +251 9XXXXXXXX or 09XXXXXXXX (9 digits after the prefix)
//     Valid Ethiopian mobile prefixes: 91, 92, 93, 94, 95, 96, 97, 98, 99, 90, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79
//   - Landline: +251 11XXXXXXX or 011XXXXXXX (Addis Ababa area code 11, 7 digits)
//   - Other regions: +251 XXXXXXXXX (area code + number)
//
// We accept the following input formats (case-insensitive):
//   0912345678        (local mobile — 10 digits starting with 0)
//   912345678         (mobile without leading 0 — 9 digits)
//   +251912345678     (international with +251 prefix)
//   251912345678      (international without +)
//   +251 91 234 5678  (with spaces — we strip them)
//
// After normalization, we validate that the number is a valid Ethiopian phone.

export function validateEthiopianPhone(phone: string): ValidationResult {
  if (!phone) return { ok: false, error: "Phone number is required." };

  // Strip all whitespace, dashes, parentheses
  let cleaned = phone.trim().replace(/[\s\-()]/g, "");

  if (!cleaned) return { ok: false, error: "Phone number is required." };

  // Remove leading +
  if (cleaned.startsWith("+")) cleaned = cleaned.slice(1);

  // Handle international format: starts with 251
  if (cleaned.startsWith("251")) {
    cleaned = "0" + cleaned.slice(3); // convert 2519XXXXXXXX → 09XXXXXXXX
  }

  // Now the number should start with 0 and be 10 digits (Ethiopian local format)
  // Or it could be 9 digits starting with 9 or 7 (without the leading 0)
  if (cleaned.startsWith("0")) {
    cleaned = cleaned.slice(1); // remove leading 0 for uniform validation
  }

  // Now we should have 9 digits
  if (!/^\d{9}$/.test(cleaned)) {
    return {
      ok: false,
      error: "Please enter a valid Ethiopian phone number (e.g. 0912345678 or +251912345678).",
    };
  }

  // Check the prefix — Ethiopian mobile numbers start with 9 or 7
  // Landline numbers start with 11 (Addis Ababa) or other area codes
  const firstDigit = cleaned[0];
  if (firstDigit === "9" || firstDigit === "7") {
    // Mobile number — 9 digits starting with 9 or 7
    // Valid mobile prefixes: 91-99, 70-79
    const prefix = cleaned.slice(0, 2);
    const validMobilePrefixes = ["91", "92", "93", "94", "95", "96", "97", "98", "99", "90", "70", "71", "72", "73", "74", "75", "76", "77", "78", "79"];
    if (!validMobilePrefixes.includes(prefix)) {
      return {
        ok: false,
        error: "Invalid Ethiopian phone prefix. Valid mobile prefixes are 91-99 or 70-79 (e.g. 0912345678).",
      };
    }
  } else if (firstDigit === "1") {
    // Landline — area codes start with 1 (e.g. 11 for Addis Ababa)
    // We accept any 9-digit number starting with 1 as a valid landline
  } else {
    return {
      ok: false,
      error: "Ethiopian phone numbers must start with 09, 07, or +251 (e.g. 0912345678).",
    };
  }

  return { ok: true };
}

// Normalize an Ethiopian phone number to international format: +2519XXXXXXXX
export function normalizeEthiopianPhone(phone: string): string {
  let cleaned = phone.trim().replace(/[\s\-()]/g, "");
  if (cleaned.startsWith("+")) cleaned = cleaned.slice(1);
  if (cleaned.startsWith("251")) cleaned = cleaned.slice(3);
  else if (cleaned.startsWith("0")) cleaned = cleaned.slice(1);
  return "+251" + cleaned;
}

// Sanitize phone input — keep only digits and + sign
export function sanitizePhone(value: string): string {
  // Keep + only at the start, and digits everywhere
  let result = value.replace(/[^\d+]/g, "");
  // If there's a + not at the start, remove it
  if (result.indexOf("+") > 0) {
    result = result.replace(/\+/g, "");
    result = "+" + result;
  }
  // Only keep one + at the start
  if (result.startsWith("+")) {
    result = "+" + result.replace(/\+/g, "");
  }
  return result;
}
