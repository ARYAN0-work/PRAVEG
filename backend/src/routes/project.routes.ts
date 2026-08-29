import { Router } from "express";
import {
  createProjectController,
  getProjectsController,
  getProjectByIdController
} from "../controllers/project.controller.js";

const router = Router();

router.post("/", createProjectController);
router.get("/", getProjectsController);
router.get("/:id", getProjectByIdController);

export default router;