import type { NextFunction, Request, Response } from "express";

export function notFoundMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const error = new Error(
    `Route not found: ${req.method} ${req.originalUrl}`,
  );

  Object.assign(error, {
    statusCode: 404,
  });

  next(error);
}