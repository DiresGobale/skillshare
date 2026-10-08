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
