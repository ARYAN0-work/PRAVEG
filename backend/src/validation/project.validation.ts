import type { Request, Response, NextFunction } from "express";

const requiredStringFields = [
  "name",
  "projectType",
  "state",
  "district",
  "compensationStatus",
  "approvalStatus",
  "possessionStatus",
  "rehabilitationStatus",
];

export const validateProjectCreate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const data = req.body;

  for (const field of requiredStringFields) {
    if (
      typeof data[field] !== "string" ||
      data[field].trim().length === 0
    ) {
      return res.status(400).json({
        status: "error",
        message: `${field} is required`,
      });
    }
  }

  if (typeof data.landArea !== "number" || data.landArea < 0) {
    return res.status(400).json({
      status: "error",
      message: "landArea must be a non-negative number",
    });
  }

  if (
    !Number.isInteger(data.affectedFamilies) ||
    data.affectedFamilies < 0
  ) {
    return res.status(400).json({
      status: "error",
      message: "affectedFamilies must be a non-negative integer",
    });
  }

  if (typeof data.legalDispute !== "boolean") {
    return res.status(400).json({
      status: "error",
      message: "legalDispute must be a boolean",
    });
  }

  next();
};