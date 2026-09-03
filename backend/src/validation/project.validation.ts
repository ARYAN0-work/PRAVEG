import type { Request, Response, NextFunction } from "express";

const isNonNegativeNumber = (value: unknown): boolean =>
  typeof value === "number" && Number.isFinite(value) && value >= 0;

const isNonNegativeInteger = (value: unknown): boolean =>
  typeof value === "number" &&
  Number.isInteger(value) &&
  value >= 0;

export const validateProjectCreate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const data = req.body;

  if (!data || typeof data !== "object") {
    return res.status(400).json({
      status: "error",
      message: "Request body is required",
    });
  }

  for (const field of ["name", "projectType", "state"]) {
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

  if (
    data.sourceProjectId !== undefined &&
    (typeof data.sourceProjectId !== "string" ||
      data.sourceProjectId.trim().length === 0)
  ) {
    return res.status(400).json({
      status: "error",
      message: "sourceProjectId must be a non-empty string",
    });
  }

  if (
    data.landArea !== undefined &&
    !isNonNegativeNumber(data.landArea)
  ) {
    return res.status(400).json({
      status: "error",
      message: "landArea must be a non-negative number",
    });
  }

  if (
    data.affectedFamilies !== undefined &&
    !isNonNegativeInteger(data.affectedFamilies)
  ) {
    return res.status(400).json({
      status: "error",
      message: "affectedFamilies must be a non-negative integer",
    });
  }

  if (
    data.stakeholderResponsiveness !== undefined &&
    !isNonNegativeNumber(data.stakeholderResponsiveness)
  ) {
    return res.status(400).json({
      status: "error",
      message:
        "stakeholderResponsiveness must be a non-negative number",
    });
  }

  if (
    data.historicalPerformance !== undefined &&
    !isNonNegativeNumber(data.historicalPerformance)
  ) {
    return res.status(400).json({
      status: "error",
      message:
        "historicalPerformance must be a non-negative number",
    });
  }

  if (
    data.districts !== undefined &&
    (!Array.isArray(data.districts) ||
      !data.districts.every(
        (district: unknown) =>
          typeof district === "string" &&
          district.trim().length > 0,
      ))
  ) {
    return res.status(400).json({
      status: "error",
      message: "districts must be an array of non-empty strings",
    });
  }

  if (
    data.districtCount !== undefined &&
    !isNonNegativeInteger(data.districtCount)
  ) {
    return res.status(400).json({
      status: "error",
      message: "districtCount must be a non-negative integer",
    });
  }

  next();
};

export const validateProjectUpdate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const data = req.body;

  if (!data || typeof data !== "object" || Object.keys(data).length === 0) {
    return res.status(400).json({
      status: "error",
      message: "Request body cannot be empty",
    });
  }

  if (
    data.name !== undefined &&
    (typeof data.name !== "string" ||
      data.name.trim().length === 0)
  ) {
    return res.status(400).json({
      status: "error",
      message: "name must be a non-empty string",
    });
  }

  if (
    data.projectType !== undefined &&
    (typeof data.projectType !== "string" ||
      data.projectType.trim().length === 0)
  ) {
    return res.status(400).json({
      status: "error",
      message: "projectType must be a non-empty string",
    });
  }

  if (
    data.state !== undefined &&
    (typeof data.state !== "string" ||
      data.state.trim().length === 0)
  ) {
    return res.status(400).json({
      status: "error",
      message: "state must be a non-empty string",
    });
  }

  if (
    data.landArea !== undefined &&
    !isNonNegativeNumber(data.landArea)
  ) {
    return res.status(400).json({
      status: "error",
      message: "landArea must be a non-negative number",
    });
  }

  if (
    data.affectedFamilies !== undefined &&
    !isNonNegativeInteger(data.affectedFamilies)
  ) {
    return res.status(400).json({
      status: "error",
      message: "affectedFamilies must be a non-negative integer",
    });
  }

  if (
    data.stakeholderResponsiveness !== undefined &&
    !isNonNegativeNumber(data.stakeholderResponsiveness)
  ) {
    return res.status(400).json({
      status: "error",
      message:
        "stakeholderResponsiveness must be a non-negative number",
    });
  }

  if (
    data.historicalPerformance !== undefined &&
    !isNonNegativeNumber(data.historicalPerformance)
  ) {
    return res.status(400).json({
      status: "error",
      message:
        "historicalPerformance must be a non-negative number",
    });
  }

  if (
    data.districts !== undefined &&
    (!Array.isArray(data.districts) ||
      !data.districts.every(
        (district: unknown) =>
          typeof district === "string" &&
          district.trim().length > 0,
      ))
  ) {
    return res.status(400).json({
      status: "error",
      message: "districts must be an array of non-empty strings",
    });
  }

  if (
    data.districtCount !== undefined &&
    !isNonNegativeInteger(data.districtCount)
  ) {
    return res.status(400).json({
      status: "error",
      message: "districtCount must be a non-negative integer",
    });
  }

  next();
};
