import type { ErrorCode } from "./error-codes.js";

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;

  constructor(
    message: string,
    statusCode: number,
    code: ErrorCode,
  ) {
    super(message);

    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;

    Error.captureStackTrace(this, AppError);
  }
}
