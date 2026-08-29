import { Router } from "express";
import {
  createProjectController,
  getProjectsController,
  getProjectByIdController,
  updateProjectController
} from "../controllers/project.controller.js";

const router = Router();

router.post("/", createProjectController);
router.get("/", getProjectsController);
router.get("/:id", getProjectByIdController);
router.patch("/:id", updateProjectController);

export default router;