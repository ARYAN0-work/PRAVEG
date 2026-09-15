import type { ErrorRequestHandler } from "express";
import { logger } from "../lib/logger.js";

export const errorMiddleware: ErrorRequestHandler = (
  error,
  req,
  res,
  _next,
) => {
  const statusCode =
    typeof error.statusCode === "number" ? error.statusCode : 500;

  logger.error(
    {
      err: error,
      requestId: res.locals.requestId,
      method: req.method,
      path: req.originalUrl,
    },
    "Request failed",
  );

  res.status(statusCode).json({
    status: "error",
    message:
      statusCode >= 500
        ? "Internal server error"
        : error.message,
    requestId: res.locals.requestId,
  });
};