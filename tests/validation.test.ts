import { describe, it, expect } from "vitest";
import {
  validateName,
  validateEmail,
  validatePassword,
  validateEthiopianPhone,
  normalizeEthiopianPhone,
  validateJobTitle,
  validateLocation,
  validateExpirationDuration,
  sanitizePhone,
} from "../src/lib/validation";

// ============================================================
// VALIDATION TESTS — critical path: registration form validation
// ============================================================

describe("Name Validation", () => {
  it("accepts valid names", () => {
    expect(validateName("John Doe").ok).toBe(true);
    expect(validateName("Amara Okafor").ok).toBe(true);
    expect(validateName("Mary-Jane").ok).toBe(true);
    expect(validateName("O'Brien").ok).toBe(true);
  });

  it("rejects empty names", () => {
    expect(validateName("").ok).toBe(false);
    expect(validateName("   ").ok).toBe(false);
  });

  it("rejects names with numbers", () => {
    expect(validateName("John123").ok).toBe(false);
    expect(validateName("User2").ok).toBe(false);
  });

  it("rejects names with special characters", () => {
    expect(validateName("John@Doe").ok).toBe(false);
    expect(validateName("John!").ok).toBe(false);
  });

  it("rejects names shorter than 2 characters", () => {
    expect(validateName("A").ok).toBe(false);
  });
});

describe("Email Validation", () => {
  it("accepts valid emails", () => {
    expect(validateEmail("user@example.com").ok).toBe(true);
    expect(validateEmail("test.user@company.co.uk").ok).toBe(true);
    expect(validateEmail("a@b.io").ok).toBe(true);
  });

  it("rejects empty emails", () => {
    expect(validateEmail("").ok).toBe(false);
  });

  it("rejects invalid formats", () => {
    expect(validateEmail("notanemail").ok).toBe(false);
    expect(validateEmail("missing@domain").ok).toBe(false);
    expect(validateEmail("@domain.com").ok).toBe(false);
    expect(validateEmail("user@").ok).toBe(false);
    expect(validateEmail("user@.com").ok).toBe(false);
  });
});

describe("Password Validation", () => {
  it("accepts passwords of 8+ characters", () => {
    expect(validatePassword("12345678").ok).toBe(true);
    expect(validatePassword("MySecurePassword123!").ok).toBe(true);
  });

  it("rejects short passwords", () => {
    expect(validatePassword("1234567").ok).toBe(false);
    expect(validatePassword("").ok).toBe(false);
  });
});

// ============================================================
// ETHIOPIAN PHONE VALIDATION TESTS
// ============================================================

describe("Ethiopian Phone Validation", () => {
  // Valid formats
  it("accepts 09XXXXXXXX format", () => {
    expect(validateEthiopianPhone("0912345678").ok).toBe(true);
    expect(validateEthiopianPhone("0971234567").ok).toBe(true);
  });

  it("accepts 07XXXXXXXX format (Safaricom Ethiopia)", () => {
    expect(validateEthiopianPhone("0712345678").ok).toBe(true);
    expect(validateEthiopianPhone("0791234567").ok).toBe(true);
  });

  it("accepts +2519XXXXXXXX format", () => {
    expect(validateEthiopianPhone("+251912345678").ok).toBe(true);
    expect(validateEthiopianPhone("+251971234567").ok).toBe(true);
  });

  it("accepts 2519XXXXXXXX format (without +)", () => {
    expect(validateEthiopianPhone("251912345678").ok).toBe(true);
  });

  it("accepts phone numbers with spaces and dashes", () => {
    expect(validateEthiopianPhone("091 234 5678").ok).toBe(true);
    expect(validateEthiopianPhone("+251-912-345-678").ok).toBe(true);
    expect(validateEthiopianPhone("(091) 234-5678").ok).toBe(true);
  });

  // Invalid formats
  it("rejects empty phone", () => {
    expect(validateEthiopianPhone("").ok).toBe(false);
  });

  it("rejects phone numbers that are too short", () => {
    expect(validateEthiopianPhone("09123").ok).toBe(false);
    expect(validateEthiopianPhone("0912345").ok).toBe(false);
  });

  it("rejects phone numbers with wrong prefix", () => {
    expect(validateEthiopianPhone("0812345678").ok).toBe(false); // starts with 08
    expect(validateEthiopianPhone("0512345678").ok).toBe(false); // starts with 05
  });

  it("rejects non-Ethiopian phone numbers", () => {
    // Kenyan numbers start with 07 but have different length/prefix
    // However 07XXXXXXXX is valid Ethiopian (Safaricom), so we test a clearly wrong one
    expect(validateEthiopianPhone("+1234567890").ok).toBe(false); // US number
    expect(validateEthiopianPhone("+447123456789").ok).toBe(false); // UK number
  });

  it("rejects phone numbers with letters", () => {
    expect(validateEthiopianPhone("09123abc5678").ok).toBe(false);
  });
});

describe("Ethiopian Phone Normalization", () => {
  it("normalizes 09XXXXXXXX to +2519XXXXXXXX", () => {
    expect(normalizeEthiopianPhone("0912345678")).toBe("+251912345678");
  });

  it("normalizes +2519XXXXXXXX to +2519XXXXXXXX", () => {
    expect(normalizeEthiopianPhone("+251912345678")).toBe("+251912345678");
  });

  it("normalizes 2519XXXXXXXX to +2519XXXXXXXX", () => {
    expect(normalizeEthiopianPhone("251912345678")).toBe("+251912345678");
  });

  it("normalizes 07XXXXXXXX to +2517XXXXXXXX", () => {
    expect(normalizeEthiopianPhone("0712345678")).toBe("+251712345678");
  });
});

describe("Phone Sanitization", () => {
  it("keeps only digits and + at the start", () => {
    expect(sanitizePhone("091 234 5678")).toBe("0912345678");
    expect(sanitizePhone("+251 912-345-678")).toBe("+251912345678");
  });

  it("removes letters", () => {
    expect(sanitizePhone("09123abc5678")).toBe("091235678");
  });

  it("removes extra + signs", () => {
    expect(sanitizePhone("+251+912+345")).toBe("+251912345");
  });
});

// ============================================================
// JOB VALIDATION TESTS
// ============================================================

describe("Job Title Validation", () => {
  it("accepts valid job titles", () => {
    expect(validateJobTitle("Software Engineer").ok).toBe(true);
    expect(validateJobTitle("Senior Frontend Developer (React)").ok).toBe(true);
    expect(validateJobTitle("C# / .NET Developer").ok).toBe(true);
  });

  it("rejects empty titles", () => {
    expect(validateJobTitle("").ok).toBe(false);
  });

  it("rejects titles shorter than 3 characters", () => {
    expect(validateJobTitle("AB").ok).toBe(false);
  });
});

describe("Location Validation", () => {
  it("accepts valid locations", () => {
    expect(validateLocation("Nairobi, Kenya").ok).toBe(true);
    expect(validateLocation("Addis Ababa").ok).toBe(true);
    expect(validateLocation("Lagos, Nigeria").ok).toBe(true);
  });

  it("rejects locations with numbers", () => {
    expect(validateLocation("123 Main St").ok).toBe(false);
  });
});

describe("Expiration Duration Validation", () => {
  it("accepts valid durations", () => {
    expect(validateExpirationDuration("7").ok).toBe(true);
    expect(validateExpirationDuration("14").ok).toBe(true);
    expect(validateExpirationDuration("30").ok).toBe(true);
    expect(validateExpirationDuration("365").ok).toBe(true);
  });

  it("rejects durations less than 1", () => {
    expect(validateExpirationDuration("0").ok).toBe(false);
    expect(validateExpirationDuration("-5").ok).toBe(false);
  });

  it("rejects durations greater than 365", () => {
    expect(validateExpirationDuration("366").ok).toBe(false);
    expect(validateExpirationDuration("1000").ok).toBe(false);
  });

  it("rejects non-numeric durations", () => {
    expect(validateExpirationDuration("abc").ok).toBe(false);
    expect(validateExpirationDuration("7.5").ok).toBe(false);
  });
});
