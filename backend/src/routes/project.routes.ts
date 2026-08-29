import { Router } from "express";
import {
  createProjectController,
  getProjectsController,
  getProjectByIdController,
  updateProjectController,
  deleteProjectController
} from "../controllers/project.controller.js";
import { validateProjectCreate } from "../validation/project.validation.js";

const router = Router();

router.post("/", validateProjectCreate, createProjectController);
router.get("/", getProjectsController);
router.get("/:id", getProjectByIdController);
router.patch("/:id", updateProjectController);
router.delete("/:id", deleteProjectController);

export default router;