import type { Request, Response } from "express";
import {
  createProject,
  getProjects,
} from "../services/project.service.js";

export const createProjectController = async (
  req: Request,
  res: Response,
) => {
  try {
    const project = await createProject(req.body);

    res.status(201).json({
      status: "success",
      data: project,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      status: "error",
      message: "Failed to create project",
    });
  }
};

export const getProjectsController = async (
  req: Request,
  res: Response,
) => {
  try {
    const projects = await getProjects();

    res.status(200).json({
      status: "success",
      data: projects,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      status: "error",
      message: "Failed to fetch projects",
    });
  }
};

