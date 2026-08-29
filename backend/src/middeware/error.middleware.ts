import type { Request, Response, NextFunction } from "express";

export const errorMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error(error);

  res.status(500).json({
    status: "error",
    message: error.message || "Internal server error",
  });
};