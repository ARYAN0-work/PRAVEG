import type { Request, Response } from "express";
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject
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


export const getProjectByIdController = async (
  req: Request,
  res: Response,
) => {
  try {
    const project = await getProjectById(req.params.id as string);

    if (!project) {
      res.status(404).json({
        status: "error",
        message: "Project not found",
      });
      return;
    }
    
    res.status(200).json({
      status: "success",
      data: project,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      status: "error",
      message: "Failed to fetch project",
    });
  }
};

export const updateProjectController = async (
  req: Request,
  res: Response,
) => {
  try {
    const project = await updateProject(
      req.params.id as string,
      req.body,
    );

    res.status(200).json({
      status: "success",
      data: project,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      status: "error",
      message: "Failed to update project",
    });
  }
};

export const deleteProjectController = async (
  req: Request,
  res: Response
) => {
  try {
    const project = await deleteProject(req.params.id as string);

    res.status(200).json({
      status: "success",
      data: project,
    });
  } catch (error) {
    console.error(error);

    res.status(404).json({
      status: "error",
      message: "Project not found",
    });
  }
};