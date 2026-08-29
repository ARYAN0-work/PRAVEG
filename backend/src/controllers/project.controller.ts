import { Request, Response } from "express";
import { createProject } from "../services/project.service.js";

export const createProjectController = async (
  req: Request,
  res: Response,
) => {
  try {
    const project = await createProject(req.body);

    res.status(201).json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error("Error creating project:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create project",
    });
  }
};