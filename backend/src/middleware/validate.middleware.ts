import type { RequestHandler } from "express";
import { z } from "zod";
import { AppError } from "../errors/app-error.js";
import { ErrorCode } from "../errors/error-codes.js";

export function validate(schema: z.ZodTypeAny): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!result.success) {
      next(
        new AppError(
          "Request validation failed",
          400,
          ErrorCode.VALIDATION_ERROR,
        ),
      );
      return;
    }

    const data = result.data as {
      body: unknown;
      params: typeof req.params;
      query: typeof req.query;
    };

    req.body = data.body;
    req.params = data.params;
    req.query = data.query;

    next();
  };
}
