export const ErrorCode = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  ML_SERVICE_ERROR: "ML_SERVICE_ERROR",
} as const;

export type ErrorCode =
  (typeof ErrorCode)[keyof typeof ErrorCode];
