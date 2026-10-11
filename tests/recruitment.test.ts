import { describe, it, expect, vi } from "vitest";

// Mock the db import so we can test the pipeline logic without a database
vi.mock("@/lib/db", () => ({
  db: {
    notification: { create: vi.fn(), createMany: vi.fn() },
    auditLog: { create: vi.fn() },
  },
}));

import {
  PIPELINE_STEPS,
  STATUS_TO_STEP,
  STATUS_PREREQUISITES,
  NEXT_STATUS,
  canTransitionTo,
  getStepFromStatus,
  getStepName,
} from "../src/lib/recruitment";

// ============================================================
// RECRUITMENT PIPELINE TESTS — critical path: 7-step enforcement
// ============================================================

describe("Pipeline Steps Definition", () => {
  it("has exactly 7 steps", () => {
    expect(PIPELINE_STEPS).toHaveLength(7);
  });

  it("steps are numbered 1 through 7", () => {
    PIPELINE_STEPS.forEach((step, i) => {
      expect(step.step).toBe(i + 1);
    });
  });

  it("each step has a name and description", () => {
    PIPELINE_STEPS.forEach((step) => {
      expect(step.name).toBeTruthy();
      expect(step.description).toBeTruthy();
    });
  });
});

describe("Status to Step Mapping", () => {
  it("maps 'applied' to step 1", () => {
    expect(STATUS_TO_STEP["applied"]).toBe(1);
  });

  it("maps 'review_passed' to step 2", () => {
    expect(STATUS_TO_STEP["review_passed"]).toBe(2);
  });

  it("maps 'exam_notified' to step 3", () => {
    expect(STATUS_TO_STEP["exam_notified"]).toBe(3);
  });

  it("maps 'exam_passed' to step 4", () => {
    expect(STATUS_TO_STEP["exam_passed"]).toBe(4);
  });

  it("maps 'interview_passed' to step 5", () => {
    expect(STATUS_TO_STEP["interview_passed"]).toBe(5);
  });

  it("maps 'selected' to step 6", () => {
    expect(STATUS_TO_STEP["selected"]).toBe(6);
  });

  it("maps 'hired' to step 7", () => {
    expect(STATUS_TO_STEP["hired"]).toBe(7);
  });
});

describe("Step from Status", () => {
  it("returns correct step for normal statuses", () => {
    expect(getStepFromStatus("applied")).toBe(1);
    expect(getStepFromStatus("reviewing")).toBe(2);
    expect(getStepFromStatus("review_passed")).toBe(2);
    expect(getStepFromStatus("exam_notified")).toBe(3);
    expect(getStepFromStatus("exam_completed")).toBe(4);
    expect(getStepFromStatus("exam_passed")).toBe(4);
    expect(getStepFromStatus("interview_notified")).toBe(5);
    expect(getStepFromStatus("interview_passed")).toBe(5);
    expect(getStepFromStatus("selected")).toBe(6);
    expect(getStepFromStatus("hired")).toBe(7);
  });

  it("returns rejection stage for rejected status", () => {
    expect(getStepFromStatus("rejected", "3")).toBe(3);
    expect(getStepFromStatus("rejected", "5")).toBe(5);
  });

  it("returns 0 for unknown status", () => {
    expect(getStepFromStatus("unknown")).toBe(0);
  });
});

describe("Step Name", () => {
  it("returns the correct name for each step", () => {
    expect(getStepName(1)).toBe("Job Application");
    expect(getStepName(2)).toBe("Application Review");
    expect(getStepName(3)).toBe("Written Exam Notification");
    expect(getStepName(4)).toBe("Written Examination");
    expect(getStepName(5)).toBe("Interview Stage");
    expect(getStepName(6)).toBe("Final Selection");
    expect(getStepName(7)).toBe("Final Call & Job Assignment");
  });
});

// ============================================================
// STRICT STEP ORDERING — no skipping allowed
// ============================================================

describe("Step Transition Enforcement (No Skipping)", () => {
  it("allows applied → reviewing", () => {
    const result = canTransitionTo("applied", "reviewing");
    expect(result.ok).toBe(true);
  });

  it("allows reviewing → review_passed", () => {
    const result = canTransitionTo("reviewing", "review_passed");
    expect(result.ok).toBe(true);
  });

  it("allows review_passed → exam_notified", () => {
    const result = canTransitionTo("review_passed", "exam_notified");
    expect(result.ok).toBe(true);
  });

  it("allows exam_notified → exam_completed", () => {
    const result = canTransitionTo("exam_notified", "exam_completed");
    expect(result.ok).toBe(true);
  });

  it("allows exam_completed → exam_passed", () => {
    const result = canTransitionTo("exam_completed", "exam_passed");
    expect(result.ok).toBe(true);
  });

  it("allows exam_passed → interview_notified", () => {
    const result = canTransitionTo("exam_passed", "interview_notified");
    expect(result.ok).toBe(true);
  });

  it("allows interview_passed → selected", () => {
    const result = canTransitionTo("interview_passed", "selected");
    expect(result.ok).toBe(true);
  });

  it("allows selected → hired", () => {
    const result = canTransitionTo("selected", "hired");
    expect(result.ok).toBe(true);
  });

  // === SKIP PREVENTION ===

  it("BLOCKS applied → hired (skip 6 steps)", () => {
    const result = canTransitionTo("applied", "hired");
    expect(result.ok).toBe(false);
    expect(result.error).toContain("Cannot move to");
    expect(result.error).toContain("selected");
  });

  it("BLOCKS applied → interview_complete (skip 4 steps)", () => {
    const result = canTransitionTo("applied", "interview_completed");
    expect(result.ok).toBe(false);
    expect(result.error).toContain("Cannot move to");
    expect(result.error).toContain("interview_notified");
  });

  it("BLOCKS applied → selected (skip 5 steps)", () => {
    const result = canTransitionTo("applied", "selected");
    expect(result.ok).toBe(false);
    expect(result.error).toContain("Cannot move to");
    expect(result.error).toContain("interview_passed");
  });

  it("BLOCKS review_passed → selected (skip 3 steps)", () => {
    const result = canTransitionTo("review_passed", "selected");
    expect(result.ok).toBe(false);
  });

  it("BLOCKS exam_passed → hired (skip 2 steps)", () => {
    const result = canTransitionTo("exam_passed", "hired");
    expect(result.ok).toBe(false);
    expect(result.error).toContain("selected");
  });

  it("BLOCKS rejected → any (already rejected)", () => {
    const result = canTransitionTo("rejected", "hired");
    expect(result.ok).toBe(false);
    expect(result.error).toContain("already been rejected");
  });

  it("BLOCKS hired → any (already hired)", () => {
    const result = canTransitionTo("hired", "selected");
    expect(result.ok).toBe(false);
    expect(result.error).toContain("already been hired");
  });

  it("BLOCKS same status → same status", () => {
    const result = canTransitionTo("applied", "applied");
    expect(result.ok).toBe(false);
  });
});

describe("Next Status Mapping", () => {
  it("returns the correct next status for each step", () => {
    expect(NEXT_STATUS["applied"]).toBe("reviewing");
    expect(NEXT_STATUS["reviewing"]).toBe("review_passed");
    expect(NEXT_STATUS["review_passed"]).toBe("exam_notified");
    expect(NEXT_STATUS["exam_notified"]).toBe("exam_completed");
    expect(NEXT_STATUS["exam_completed"]).toBe("exam_passed");
    expect(NEXT_STATUS["exam_passed"]).toBe("interview_notified");
    expect(NEXT_STATUS["interview_notified"]).toBe("interview_completed");
    expect(NEXT_STATUS["interview_completed"]).toBe("interview_passed");
    expect(NEXT_STATUS["interview_passed"]).toBe("selected");
    expect(NEXT_STATUS["selected"]).toBe("hired");
  });
});
