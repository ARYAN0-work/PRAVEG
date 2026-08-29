import type { Request, Response } from "express";

export const notFoundMiddleware = (
  req: Request,
  res: Response,
) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
  });
};