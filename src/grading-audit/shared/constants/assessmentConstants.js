/**
 * Enum representing the different types of assessments.
 */
export const AssessmentType = Object.freeze({
  INTERNAL_GRADING: "INTERNAL_GRADING",
  EXTERNAL_GRADING: "EXTERNAL_GRADING",
  INTERNAL_AUDIT: "INTERNAL_AUDIT",
  EXTERNAL_AUDIT: "EXTERNAL_AUDIT"
});

/**
 * Enum representing the category of a cycle.
 */
export const CycleCategory = Object.freeze({
  GRADING: "GRADING",
  AUDIT: "AUDIT"
});

/**
 * Enum representing the possible statuses of a cycle.
 */
export const CycleStatus = Object.freeze({
  NOT_STARTED: "NOT_STARTED",
  OPEN: "OPEN",
  CLOSED: "CLOSED",
  ARCHIVED: "ARCHIVED"
});

/**
 * Enum representing the type of a cycle.
 */
export const CycleType = Object.freeze({
  INTERNAL: "INTERNAL",
  EXTERNAL: "EXTERNAL"
});

/**
 * Enum representing the frequency of recurring events.
 */
export const Frequency = Object.freeze({
  QUARTERLY: "QUARTERLY",
  HALF_YEARLY: "HALF_YEARLY",
  YEARLY: "YEARLY"
});

/**
 * Enum representing grade letters for assessments.
 */
export const GradeLetter = Object.freeze({
  A_PLUS: "A+",
  A: "A",
  B: "B",
  C: "C",
  D: "D"
});

/**
 * Enum representing the possible statuses of an assessment.
 */
export const AssessmentStatus = Object.freeze({
  DRAFT: "DRAFT",
  SUBMITTED: "SUBMITTED"
});

/**
 * Enum representing labels for periods in cycles.
 */
export const PeriodLabel = Object.freeze({
  Q1: "Q1",
  Q2: "Q2",
  Q3: "Q3",
  Q4: "Q4",
  H1: "H1",
  H2: "H2",
  FY: "FY"
});

/**
 * Enum representing team roles.
 */
export const TeamRole = Object.freeze({
  LEAD: "LEAD",
  MEMBER: "MEMBER"
});

export const ViewType = Object.freeze({
  SELF: "SELF",
  ASSIGNED: "ASSIGNED"
});