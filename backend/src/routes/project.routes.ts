import { Router } from "express";
import { createProjectController } from "../controllers/project.controller.js";

const router = Router();

router.post("/", createProjectController);

export default router;